#!/usr/bin/env python3
"""Register the local Autumn OIDC client; writes its secret only to ignored .env."""
from pathlib import Path
import base64
import hashlib
import os
import secrets
import subprocess

root = Path(__file__).resolve().parents[1]
env = root / '.env'
existing = env.read_text() if env.exists() else ''
if any(line.startswith(('LOFTLANCER_OIDC_CLIENT_ID=', 'LOFTLANCER_OIDC_CLIENT_SECRET=')) for line in existing.splitlines()):
    raise SystemExit('OIDC credentials already exist; refusing to replace them.')
client_id = 'autumn-local-' + secrets.token_hex(12)
secret = secrets.token_urlsafe(48)
hashed = base64.urlsafe_b64encode(hashlib.sha256(secret.encode()).digest()).decode().rstrip('=')
# Generated values contain only URL-safe characters; no user input enters SQL.
api_origin = os.environ.get("AUTUMN_PUBLIC_API_ORIGIN", "http://localhost:4002").rstrip("/")
callback = f"{api_origin}/api/auth/oauth2/callback/loftlancer"
sql = """INSERT INTO oauth_client (id,client_id,client_secret,created_at,updated_at,name,redirect_uris,scopes,token_endpoint_auth_method,application_type,grant_types,response_types,require_pkce,skip_consent) VALUES ('{id}','{id}','{hashed}',now(),now(),'Local Autumn dashboard',ARRAY['{callback}'],ARRAY['openid','profile','email'],'client_secret_post','web',ARRAY['authorization_code'],ARRAY['code'],true,true);""".format(id=client_id, hashed=hashed, callback=callback)
fd = os.open(env, os.O_WRONLY | os.O_CREAT | os.O_APPEND, 0o600)
os.fchmod(fd, 0o600)
with os.fdopen(fd, 'a') as out:
    out.write(f'\nLOFTLANCER_OIDC_CLIENT_ID={client_id}\nLOFTLANCER_OIDC_CLIENT_SECRET={secret}\n')
result = subprocess.run(['docker','exec','-i','loftlancer-postgres','psql','-v','ON_ERROR_STOP=1','-U','postgres','-d','loftlancer_auth'], input=sql, text=True, capture_output=True)
if result.returncode:
    env.write_text(existing)
    os.chmod(env, 0o600)
    raise SystemExit('Registration failed: ' + result.stderr)
print('Registered local Autumn OIDC client; credentials saved in infra/autumn/.env.')

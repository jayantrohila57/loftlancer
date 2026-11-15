import { IconButton } from "@autumn/ui";
import { LockKeyIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { CustomToaster } from "@/components/general/CustomToaster";
import { authClient, useSession } from "@/lib/auth-client";
import { getSafeNextPath } from "@/utils/genUtils";
import { AuthBackground } from "./components/AuthBackground";
import { AutumnWordmark } from "./components/AutumnWordmark";

// PasswordSignIn still imports this shared validator in the upstream bundle.
export const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;

function getOAuthRedirectUrl(searchParams: URLSearchParams): string | null {
	const clientId = searchParams.get("client_id");
	const responseType = searchParams.get("response_type");
	const redirectUri = searchParams.get("redirect_uri");
	if (clientId && responseType && redirectUri) {
		const backendUrl = import.meta.env.VITE_BACKEND_URL;
		return `${backendUrl}/api/auth/oauth2/authorize?${searchParams.toString()}`;
	}
	return null;
}

/**
 * Local dashboard sign-in: Loftlancer Auth SSO only (no Autumn-native email OTP or Google).
 */
export const SignIn = () => {
	const [isLoading, setIsLoading] = useState(false);
	const { data: session } = useSession();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const oauthRedirectUrl = useMemo(
		() => getOAuthRedirectUrl(searchParams),
		[searchParams],
	);
	const defaultPath = getSafeNextPath(searchParams);

	useEffect(() => {
		if (oauthRedirectUrl) return;
		if (session) {
			navigate(defaultPath, { replace: true });
		}
	}, [session, navigate, oauthRedirectUrl, defaultPath]);

	const handleContinueWithSso = async () => {
		setIsLoading(true);
		try {
			const callbackURL =
				oauthRedirectUrl || `${window.location.origin}${defaultPath}`;
			const result = await authClient.signIn.oauth2({
				providerId: "loftlancer",
				callbackURL,
			});
			if (result.error) {
				toast.error(result.error.message || "Unable to sign in with SSO");
			}
		} catch {
			toast.error("Unable to sign in with SSO");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AuthBackground>
			<CustomToaster />
			<div className="flex flex-col items-center gap-6">
				<div className="flex flex-col items-center gap-3">
					<AutumnWordmark className="h-7 w-auto text-foreground" />
					<p className="text-sm text-muted-foreground">
						Welcome to Autumn — sign in with Loftlancer SSO
					</p>
				</div>
				<div className="w-full space-y-5">
					<IconButton
						variant="primary"
						onClick={handleContinueWithSso}
						isLoading={isLoading}
						icon={<LockKeyIcon weight="fill" />}
						className="w-full gap-2"
					>
						Continue with SSO
					</IconButton>
				</div>
			</div>
		</AuthBackground>
	);
};

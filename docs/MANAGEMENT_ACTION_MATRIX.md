# Management action and access matrix

Generated from `@loftlancer/actions` registry at the time of this audit. Update this table alongside registry changes. `action_blocked` is evaluated before role/grant rules. Platform actions remain disabled; user actions are session/user scoped.

| Action | Scope | Eligible org role(s) | Additional grant | Denial reasons |
| --- | --- | --- | --- | --- |
| `platform.user.list` | platform | self/platform | role | `platform-admin-disabled` |
| `platform.user.set_role` | platform | self/platform | role | `platform-admin-disabled` |
| `platform.user.impersonate` | platform | self/platform | role | `platform-admin-disabled` |
| `platform.support.grant_manager` | platform | self/platform | role | `platform-admin-disabled` |
| `platform.support.revoke_manager` | platform | self/platform | role | `platform-admin-disabled` |
| `support.ticket.create` | user | self/platform | role | `user-scope` |
| `support.ticket.read` | user | self/platform | role | `user-scope` |
| `support.ticket.list` | user | self/platform | role | `user-scope` |
| `support.ticket.reply` | user | self/platform | role | `user-scope` |
| `support.ticket.assign` | user | self/platform | role | `user-scope` |
| `support.ticket.status.change` | user | self/platform | role | `user-scope` |
| `support.ticket.priority.change` | user | self/platform | role | `user-scope` |
| `support.ticket.reopen` | user | self/platform | role | `user-scope` |
| `support.ticket.delete` | user | self/platform | role | `user-scope` |
| `support.faq.read` | user | self/platform | role | `user-scope` |
| `support.faq.create` | user | self/platform | role | `user-scope` |
| `support.faq.update` | user | self/platform | role | `user-scope` |
| `support.faq.delete` | user | self/platform | role | `user-scope` |
| `organization.create` | user | self/platform | role | `user-scope` |
| `organization.update` | organization | owner | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `organization.delete` | organization | owner | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `organization.list` | user | self/platform | role | `user-scope` |
| `organization.view` | organization | owner,manager,member | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `organization.hub.view` | organization | owner,manager,member | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `organization.transfer_ownership` | organization | owner | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `organization.settings.view` | organization | owner,manager | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `organization.settings.update` | organization | owner | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `organization.archive` | organization | owner | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `organization.unarchive` | organization | owner | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `organization.restore` | organization | owner | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `member.list` | organization | owner,manager | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `member.invite` | organization | owner,manager | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `member.remove` | organization | owner | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `member.role.update` | organization | owner | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `invitation.accept` | user | self/platform | role | `user-scope` |
| `invitation.reject` | user | self/platform | role | `user-scope` |
| `invitation.cancel` | organization | owner | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `team.create` | organization | owner,manager | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `team.update` | organization | owner,manager | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `team.delete` | organization | owner,manager | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `team.restore` | organization | owner,manager | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `team.member.list` | organization | owner,manager,team lead | team role or org role | `no_org_role`, `org_role_denied`, `team_org_mismatch`, `action_blocked` |
| `team.member.add` | organization | owner,manager,team lead | team role or org role | `no_org_role`, `org_role_denied`, `team_org_mismatch`, `action_blocked` |
| `team.member.remove` | organization | owner,manager,team lead | team role or org role | `no_org_role`, `org_role_denied`, `team_org_mismatch`, `action_blocked` |
| `team.member.role.change` | organization | owner,manager | role | `no_org_role`, `org_role_denied`, `team_org_mismatch`, `action_blocked` |
| `project.create` | organization | owner | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `project.read` | project | owner,manager,member | grant:project.read | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `project.update` | project | owner,manager,member | grant:project.update | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `project.delete` | organization | owner | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `project.restore` | project | owner,manager | grant:project.restore | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `project.archive` | project | owner,manager | grant:project.archive | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `project.unarchive` | project | owner,manager | grant:project.unarchive | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `project.status.change` | project | owner,manager | grant:project.status.change | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `project.public.toggle` | project | owner,manager | grant:project.public.toggle | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `project.app.list` | project | owner,manager,member | grant:project.read | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `project.app.install` | project | owner,manager | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `project.app.uninstall` | project | owner,manager | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `project.app.configure` | project | owner,manager | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `tasks.task.read` | project | owner,manager,member | grant:project.read | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `tasks.task.create` | project | owner,manager,member | grant:tasks.task.create | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `tasks.task.update` | project | owner,manager,member | grant:tasks.task.update | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `tasks.task.delete` | project | owner,manager,member | grant:tasks.task.delete | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `tasks.comment.create` | project | owner,manager,member | grant:tasks.task.update | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `project.assign_manager` | organization | owner | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `project.assign_team` | project | owner,manager | grant:project.assign_team | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `project.permission.grant` | project | owner,manager | grant:project.permission.grant | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `environment.create` | project | owner,manager,member | grant:environment.create | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `environment.read` | project | owner,manager,member | grant:environment.read | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `environment.update` | project | owner,manager,member | grant:environment.update | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `environment.delete` | project | owner,manager | grant:environment.delete | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `environment.restore` | project | owner,manager | grant:environment.restore | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `variable.create` | project | owner,manager,member | grant:variable.create | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `variable.read` | project | owner,manager,member | grant:variable.read | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `variable.update` | project | owner,manager,member | grant:variable.update | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `variable.delete` | project | owner,manager,member | grant:variable.delete | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `variable.reveal` | project | owner,manager,member | grant:variable.reveal | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `variable.bulk_import` | project | owner,manager | grant:variable.bulk_import | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `variable.export` | project | owner,manager,member | grant:variable.export | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `variable.restore` | project | owner,manager | grant:variable.restore | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `audit.timeline.view.org` | organization | owner,manager | grant:audit.timeline.view.org | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `audit.timeline.view.project` | project | owner,manager,member | grant:audit.timeline.view.project | `no_org_role`, `org_role_denied`, `project_assignment_required`, `grant_missing`, `action_blocked` |
| `audit.timeline.view.user` | organization | owner | role | `no_org_role`, `org_role_denied`, `action_blocked` |
| `audit.timeline.view.self` | user | self/platform | role | `user-scope` |
| `notification.list` | user | self/platform | role | `user-scope` |
| `notification.mark_read` | user | self/platform | role | `user-scope` |
| `notification.mark_unread` | user | self/platform | role | `user-scope` |
| `profile.view` | user | self/platform | role | `user-scope` |
| `profile.update` | user | self/platform | role | `user-scope` |
| `session.sign_in` | user | self/platform | role | `user-scope` |
| `session.sign_out` | user | self/platform | role | `user-scope` |
| `session.list` | user | self/platform | role | `user-scope` |
| `session.revoke` | user | self/platform | role | `user-scope` |
| `session.revoke_others` | user | self/platform | role | `user-scope` |
| `account.list` | user | self/platform | role | `user-scope` |
| `account.link` | user | self/platform | role | `user-scope` |
| `account.unlink` | user | self/platform | role | `user-scope` |
| `account.export` | user | self/platform | role | `user-scope` |
| `account.delete` | user | self/platform | role | `user-scope` |

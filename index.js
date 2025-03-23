const readline = require("readline");

const config = require("./config.json");

const events = [
	"branch_protection_configuration",
	"branch_protection_rule",
	"check_run",
	"check_suite",
	"code_scanning_alert",
	"commit_comment",
	"create",
	"delete",
	"deploy_key",
	"deployment",
	"dependabot_alert",
	"deployment_status",
	"discussion",
	"discussion_comment",
	"fork",
	"gollum",
	"issue_comment",
	"issues",
	"label",
	"member",
	"merge_group",
	"meta",
	"milestone",
	"package",
	"page_build",
	"ping",
	"project_card",
	"project_column",
	"project",
	"public",
	"pull_request",
	"pull_request_review",
	"pull_request_review_comment",
	"pull_request_review_thread",
	"push",
	"release",
	"registry_package",
	"repository",
	"repository_advisory",
	"repository_import",
	"repository_ruleset",
	"repository_vulnerability_alert",
	"secret_scanning_alert",
	"secret_scanning_alert_location",
	"secret_scanning_scan",
	"security_and_analysis",
	"star",
	"status",
	"sub_issues",
	"team_add",
	"watch",
	"workflow_job",
	"workflow_run"
];

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const webhooks = [
	{ url: config.urls[0], filter: (event) => ["push", "create", "delete"].includes(event) },
	{ url: config.urls[1], filter: (event) => ["release"].includes(event) },
	{ url: config.urls[2], filter: (event) => !["push", "create", "delete", "release"].includes(event) }
];

async function addWebhooks(repoName) {
	try {
		const { Octokit } = await import("@octokit/rest");
		const octokit = new Octokit({ auth: config.token });
		const repos = (await octokit.repos.listForAuthenticatedUser({
			sort: "created",
			per_page: 100,
			visibility: "all"
		})).data;

		const selectedRepo = repos.find(repo => {
			if (repo.name == repoName) return true;
			else console.log(value.full_name);
		});
		if (!selectedRepo) {
			console.log(`Repository ${repoName} not found.`);
			rl.close();
			return;
		}

		if (selectedRepo.archived) {
			console.log(`Skipping archived repository: ${selectedRepo.name}`);
			rl.close();
			return;
		}

		for (const hook of webhooks) {
			const filteredEvents = events.filter(hook.filter);
			if (filteredEvents.length > 0) {
				await octokit.repos.createWebhook({
					owner: config.username,
					repo: selectedRepo.name,
					config: {
						url: hook.url,
						content_type: "json",
						insecure_ssl: "0"
					},
					events: filteredEvents
				});
				console.log(
					`Webhook added to ${selectedRepo.name}: ${hook.url} for events: ${filteredEvents.join(
						", "
					)}`
				);
			}
		}
		rl.close();
	} catch (error) {
		console.error("Error adding webhooks:", error);
		rl.close();
	}
}

rl.question("Enter the repository name: ", (repoName) => {
	addWebhooks(repoName);
});
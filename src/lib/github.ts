export async function fetchGitHubIssue(url: string) {
    // Extract owner, repo, and issue number from URL
    // Format: https://github.com/owner/repo/issues/123
    const regex = /github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)/;
    const match = url.match(regex);

    if (!match) {
        throw new Error("Invalid GitHub Issue URL");
    }

    const [, owner, repo, issueNumber] = match;

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;

    const headers: HeadersInit = {
        "Accept": "application/vnd.github.v3+json",
    };

    if (process.env.GITHUB_TOKEN) {
        headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
        throw new Error(`Failed to fetch issue: ${response.statusText}`);
    }

    const data = await response.json();

    return {
        title: data.title,
        description: data.body, // GitHub returns markdown body
        repoUrl: `https://github.com/${owner}/${repo}`,
        issueNumber: parseInt(issueNumber),
        owner,
        repo
    };
}

export async function fetchPRDiff(url: string) {
    const diffUrl = url.endsWith('.diff') ? url : `${url}.diff`;

    const response = await fetch(diffUrl);
    if (!response.ok) {
        throw new Error("Failed to fetch PR diff");
    }

    return await response.text();
}

export async function fetchPRDetails(url: string) {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;
    const match = url.match(regex);

    if (!match) {
        throw new Error("Invalid GitHub PR URL");
    }

    const [, owner, repo, prNumber] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;

    const headers: HeadersInit = {
        "Accept": "application/vnd.github.v3+json",
    };

    if (process.env.GITHUB_TOKEN) {
        headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(apiUrl, { headers });
    if (!response.ok) throw new Error("Failed to fetch PR details");

    return await response.json();
}

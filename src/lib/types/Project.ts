export interface Project {
	title: string;
	repoName?: string;
	repoOwner?: string;
	description: string;
	image?: string;
	technologies: string[];
	githubUrl: string;
	createdAt?: Date;
	lastUpdatedAt?: Date;
	websiteUrl?: string;
	pinned: boolean;
}

export interface RepoMetadata {
	repos: RepoDetails[];
}

export interface RepoDetails {
	name: string;
	owner: string;
}

export interface RepoMetadataResponse {
	repoDetails: Record<string, RepoMetadataDetail>;
}

export interface RepoMetadataDetail {
	createdAt: string;
	updatedAt: string;
}

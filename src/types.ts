declare global {
    type Project = {
        id: number
        description: string
        name: string
        name_with_namespace: string
        path: string
        path_with_namespace: string
        created_at: string
        default_branch: string
        tag_list: string[]
        topics: string[]
        ssh_url_to_repo: string
        http_url_to_repo: string
        web_url: string
        readme_url: null
        forks_count: number
        avatar_url: string
        star_count: number
        last_activity_at: string
        visibility: string
        namespace: Namespace
        container_registry_image_prefix: string
        _links: Links
        marked_for_deletion_at: null
        marked_for_deletion_on: null
        packages_enabled: null
        empty_repo: boolean
        archived: boolean
        resolve_outdated_diff_discussions: boolean
        container_expiration_policy: ContainerPolicy
        repository_object_format: string
        issues_enabled: boolean
        merge_requests_enabled: boolean
        wiki_enabled: boolean
        jobs_enabled: boolean
        snippets_enabled: boolean
        container_registry_enabled: boolean
        service_desk_enabled: boolean
        service_desk_address: null
        can_create_merge_request_in: boolean
        issues_access_level: EnabledDisabled
        repository_access_level: EnabledDisabled
        merge_requests_access_level: EnabledDisabled
        forking_access_level: EnabledDisabled
        wiki_access_level: EnabledDisabled
        builds_access_level: EnabledDisabled
        snippets_access_level: EnabledDisabled
        pages_access_level: string
        analytics_access_level: EnabledDisabled
        container_registry_access_level: EnabledDisabled
        security_and_compliance_access_level: string
        releases_access_level: EnabledDisabled
        environments_access_level: EnabledDisabled
        feature_flags_access_level: EnabledDisabled
        infrastructure_access_level: EnabledDisabled
        monitor_access_level: EnabledDisabled
        model_experiments_access_level: EnabledDisabled
        model_registry_access_level: EnabledDisabled
        emails_disabled: boolean
        emails_enabled: boolean
        shared_runners_enabled: boolean
        lfs_enabled: boolean
        creator_id: null
        import_status: string
        open_issues_count: number
        description_html: string
        updated_at: string
        ci_config_path: null
        public_jobs: boolean
        shared_with_groups: []
        only_allow_merge_if_pipeline_succeeds: boolean
        allow_merge_on_skipped_pipeline: boolean
        request_access_enabled: boolean
        only_allow_merge_if_all_discussions_are_resolved: boolean
        remove_source_branch_after_merge: boolean
        printing_merge_request_link_enabled: boolean
        merge_method: string
        merge_request_title_regex: null
        merge_request_title_regex_description: null
        squash_option: string
        enforce_auth_checks_on_uploads: boolean
        suggestion_commit_message: string
        merge_commit_template: null
        squash_commit_template: null
        issue_branch_template: null
        warn_about_potentially_unwanted_characters: boolean
        autoclose_referenced_issues: boolean
        max_artifacts_size: null
        requirements_enabled: boolean
        requirements_access_level: string
        security_and_compliance_enabled: boolean
        compliance_frameworks: []
    }

    type Vulnerability = {
        repository: string
        folder: string
        summary: string
        vulnerabilities: {
            info: number
            low: number
            moderate: number
            high: number
            critical: number
        }
    }

    type Notified = {
        critical: VulnerabilityIdentifier[]
        high: VulnerabilityIdentifier[]
        medium: VulnerabilityIdentifier[]
    }

    type Severity = 'critical' | 'high' | 'none'
}

type VulnerabilityIdentifier = {
    name: string
    count: number
    time: number
}

type Namespace = {
    id: number
    name: string
    path: string
    kind: string
    full_path: string
    parent_id: number
    avatar_url: string
    web_url: string
}

type Links = {
    self: string
    issues: string
    merge_requests: string
    repo_branches: string
    labels: string
    events: string
    members: string
    cluster_agents: string
}

type EnabledDisabled = 'enabled' | 'disabled'

type ContainerPolicy = {
    cadence: string
    enabled: false
    keep_n: null
    older_than: null
    name_regex: null
    name_regex_keep: null
    next_run_at: string
}

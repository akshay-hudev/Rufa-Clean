import type {
  RepositoryAccessAuthorizer,
  RepositoryAccessDecision,
  RepositoryAccessRequest,
} from "../access/repository-access";

/**
 * An explicit test double. Production composition roots never import this
 * module; tests use it to prove that executable boundaries require an access
 * decision without consulting the active external-repository authorization.
 */
export const testRepositoryAccess: RepositoryAccessAuthorizer = {
  authorizedDiscoveryOwners(): string[] {
    return ["fixture"];
  },
  decide(request: RepositoryAccessRequest): RepositoryAccessDecision {
    return {
      allowed: true,
      repositoryFullName: `${request.repository.owner}/${request.repository.name}`,
      role: request.role,
      operation: request.operation,
      authorizationId: "test-only-authorization",
      reason: "authorized",
    };
  },
  assert(request: RepositoryAccessRequest): RepositoryAccessDecision {
    return this.decide(request);
  },
};

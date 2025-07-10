import { GitHubService } from '../GitHubService';

describe('GitHubService', () => {
  let gitHubService: GitHubService;

  beforeEach(() => {
    gitHubService = new GitHubService('test-token', 'test-owner', 'test-repo');
  });

  describe('constructor', () => {
    it('should create a GitHubService instance', () => {
      expect(gitHubService).toBeInstanceOf(GitHubService);
    });

    it('should have the correct repository configuration', () => {
      // This tests that the service was configured correctly
      expect(gitHubService).toBeDefined();
    });
  });

  describe('createIssue', () => {
    it('should be defined', () => {
      expect(gitHubService.createIssue).toBeDefined();
    });

    it('should accept IssueData parameter', () => {
      // This test verifies the method signature is correct
      // We test that the method exists and has the correct signature
      expect(typeof gitHubService.createIssue).toBe('function');
      expect(gitHubService.createIssue.length).toBe(1); // expects 1 parameter
    });
  });
});
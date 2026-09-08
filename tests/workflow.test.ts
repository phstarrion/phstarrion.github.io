import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const workflowPath = join(testDirectory, '..', '.github', 'workflows', 'deploy.yml');

describe('GitHub Pages deployment workflow', () => {
  it('limits write permissions to the deploy job while preserving its build gate', async () => {
    const workflow = parse(await readFile(workflowPath, 'utf8'));

    expect(workflow.permissions).toEqual({ contents: 'read' });
    expect(workflow.jobs.build.permissions ?? workflow.permissions).toEqual({ contents: 'read' });
    expect(workflow.jobs.deploy.permissions).toEqual({
      contents: 'read',
      pages: 'write',
      'id-token': 'write',
    });
    expect(workflow.jobs.deploy.needs).toBe('build');
    expect(workflow.jobs.deploy.steps).toContainEqual(
      expect.objectContaining({ uses: 'actions/deploy-pages@v4' }),
    );
  });
});

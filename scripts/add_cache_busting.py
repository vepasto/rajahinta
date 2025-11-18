#!/usr/bin/env python3
"""
Script to add Git commit hash as query parameter to JS/CSS file references in HTML files.
This ensures cache invalidation when files are updated.
"""

import os
import re
import subprocess
import sys
from pathlib import Path

def get_git_commit_hash():
    """Get the current Git commit hash (short version).
    
    In CI/CD, this gets the commit hash that triggered the workflow.
    For local development, it gets the current HEAD commit hash.
    """
    try:
        # Try to get commit hash from GitHub Actions environment variable first
        # This is the commit that triggered the workflow
        ci_commit = os.environ.get('GITHUB_SHA')
        if ci_commit:
            # Return short version
            return ci_commit[:7]
        
        # Fallback to current HEAD (for local development)
        result = subprocess.run(
            ['git', 'rev-parse', '--short', 'HEAD'],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        print("Warning: Could not get Git commit hash. Using 'dev' as fallback.", file=sys.stderr)
        return 'dev'

def add_cache_busting_to_html(html_file, commit_hash):
    """Add cache busting query parameter to JS/CSS file references."""
    html_path = Path(html_file)
    
    if not html_path.exists():
        print(f"Error: File {html_file} does not exist.", file=sys.stderr)
        return False
    
    content = html_path.read_text(encoding='utf-8')
    original_content = content
    
    # Pattern to match JS/CSS file references
    # Matches: href="css/file.css" or src="js/file.js" or src="../js/file.js"
    patterns = [
        # CSS files
        (r'(href=["\'])(css/[^"\']+\.css)(["\'])', r'\1\2?v=' + commit_hash + r'\3'),
        (r'(href=["\'])(\.\./css/[^"\']+\.css)(["\'])', r'\1\2?v=' + commit_hash + r'\3'),
        # JS files
        (r'(src=["\'])(js/[^"\']+\.js)(["\'])', r'\1\2?v=' + commit_hash + r'\3'),
        (r'(src=["\'])(\.\./js/[^"\']+\.js)(["\'])', r'\1\2?v=' + commit_hash + r'\3'),
    ]
    
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        html_path.write_text(content, encoding='utf-8')
        print(f"Updated {html_file} with cache busting (commit: {commit_hash})")
        return True
    else:
        print(f"No changes needed for {html_file}")
        return False

def main():
    """Main function."""
    commit_hash = get_git_commit_hash()
    
    # HTML files to update
    html_files = [
        'docs/index.html',
        'docs/graphs/index.html',
        'docs/info/index.html',
    ]
    
    updated_count = 0
    for html_file in html_files:
        if add_cache_busting_to_html(html_file, commit_hash):
            updated_count += 1
    
    if updated_count > 0:
        print(f"\nCache busting added to {updated_count} file(s) using commit hash: {commit_hash}")
        return 0
    else:
        print("\nNo files were updated.")
        return 0

if __name__ == '__main__':
    sys.exit(main())


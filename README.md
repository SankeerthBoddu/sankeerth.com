# sankeerth.com

Source for [sankeerth.com](https://sankeerth.com), built with Jekyll and hosted on GitHub Pages.

## Local development

```bash
git config user.name "Sankeerth Boddu"
git config user.email "mail@sankeerth.com"
bundle install
bundle exec jekyll serve
```

Then open `http://127.0.0.1:4000`.

The `_local/` directory contains private working notes, study material, publishing context, and future project planning. It is intentionally gitignored and must not be committed to the public repository.

The dependency lock is generated locally rather than committed because GitHub Pages owns the production build environment. Run `bundle update` before local validation when the Pages dependency changes.

## Maintenance

- GitHub Actions builds the site and checks internal links on every push and pull request.
- Dependabot checks Bundler and GitHub Actions dependencies monthly.
- Commit with `mail@sankeerth.com`; `.mailmap` normalizes older public Gmail attribution in supporting Git tools.

## Content

- personal projects and experience
- Enterprise AI writing and technical diagrams
- project links for RAGAssure, Secure Enterprise AI Assistant, and other public work

## License

See [`LICENSE`](LICENSE).

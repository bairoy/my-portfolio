# Module 3: The Git-Based CMS

This module explains how we built a dynamic Content Management System (CMS) without paying for a database or complex backend infrastructure using **Decap CMS**.

---

## 1. What is a Headless CMS?
In traditional architectures (like WordPress), the CMS and the Frontend are tightly coupled. The server queries a MySQL database on every single page load.

A **Headless CMS** separates the content from the frontend. We used Decap CMS, which is uniquely powerful because it is a **Git-based CMS**. 
It doesn't store your data in a database. Instead, when you click "Publish" in the CMS dashboard, it commits Markdown (`.md`) files directly to your GitHub repository!

## 2. Configuration (`config.yml`)
The entire CMS dashboard is generated from a single file: `public/admin/config.yml`.

### Example: Defining the Projects Collection
```yaml
collections:
  - name: "projects"
    label: "Projects"
    folder: "content/projects" # Where to save the markdown files
    create: true
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Description", name: "description", widget: "text"}
      - {label: "Technologies", name: "tech", widget: "list"}
      - {label: "GitHub Link", name: "githubUrl", widget: "string", required: false}
      - {label: "Body", name: "body", widget: "markdown"}
```
By simply defining these fields, Decap CMS automatically builds a beautiful React UI for you to input data. When you save it, it writes a file to `content/projects/my-project.md`.

## 3. The Git-Triggered Deployment Workflow
Because your content is just Markdown files in a Git repository, we unlock an incredibly powerful and free CI/CD pipeline.

1. **You edit your Identity Profile** in the CMS and click "Publish".
2. **Decap CMS** authenticates with your GitHub account via OAuth and pushes a commit to your `main` branch.
3. **Netlify** listens to GitHub webhooks. When it sees the new commit, it automatically spins up a build server.
4. Netlify runs `npm run build`, which executes our vectorization script (Module 4) and then builds the Next.js static HTML.
5. The new website goes live globally in seconds.

## Summary: How to apply this yourself
1. When building content-heavy sites (like blogs, portfolios, or documentation) for yourself or clients, avoid heavy databases.
2. Use Decap CMS (or similar Git-based systems). It gives your non-technical users a friendly dashboard, while keeping your architecture perfectly version-controlled in Git.
3. Your data will never be lost, because your content *is* your codebase!

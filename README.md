deployment link:https://elysiumusic.netlify.app/

## Deployment on Netlify (with Secure API Key)

Since `config.js` is ignored by Git, you need to tell Netlify how to create it during deployment.

1.  **Push to GitHub:** Push your code (including `config.example.js`).
2.  **Netlify "Build & Deploy" Settings:**
    *   **Build Command:** `echo "const config = { API_KEY: '$API_KEY' };" > config.js`
    *   **Publish Directory:** `.` (or empty if it's the root)
3.  **Environment Variables:**
    *   Go to **Site configuration > Environment variables**.
    *   Add a new variable named `API_KEY` and paste your actual Google API Key as the value.

Netlify will run the build command, which creates the `config.js` file using your secret key just before publishing the site.

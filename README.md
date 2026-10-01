# trans<form>er

An interactive recreation of the supplied transformer sign-in reference. Built with Vite, vanilla JavaScript, CSS, and Three.js. The robot is a procedural model; no external model or image downloads are needed.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:5173 and click **Continue**. The sign-in panel breaks into purple-edged fragments and folds into a blue mechanical robot. The robot animates and folds back into the form automatically. Drag the robot to turn it, or use **Return to form** or Escape to return early.

Passkey and SSO also trigger the visual demo. Create account switches the form presentation. Authentication and password recovery are demonstration controls and are not connected to a service.

```sh
npm run build
npm run preview
```

The interface supports keyboard focus, small screens, and reduced motion. The 3D model and transformation timing approximate the reference rather than use the original assets.

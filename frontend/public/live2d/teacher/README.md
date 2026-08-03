# Teacher Live2D Model Folder

Drop your real Live2D model files here.

The final expected file should be:

```text
frontend/public/live2d/teacher/teacher.model3.json
```

The `.model3.json` file points to the other files in this folder, such as:

```text
teacher.moc3
textures/texture_00.png
motions/*.motion3.json
teacher.physics3.json
teacher.pose3.json
expressions/*.exp3.json
```

You can rename an official sample model file to `teacher.model3.json`, but make sure the internal references still match the actual files in the folder.

Do not delete this folder. The React app will look here for the Live2D teacher avatar.


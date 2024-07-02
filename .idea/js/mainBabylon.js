const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);

    // Create a basic light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);
    light.intensity = 0.7;

    // Create a camera and attach it to the canvas
    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 20, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5;

    let array = [];
    let boxContainer = [];
    let shelfContainer = [];

    const peachColor = "#FFDAB9"; // Define the Peach color

    const createBoxWithColor = (index) => {
        // Create the box
        const box = BABYLON.MeshBuilder.CreateBox(`box${index}`, { size: 2 }, scene);
        box.position = new BABYLON.Vector3(index * 2, 0, 0);

        // Create the material
        const boxMaterial = new BABYLON.StandardMaterial(`boxMaterial${index}`, scene);
        boxMaterial.diffuseColor = BABYLON.Color3.FromHexString(peachColor);
        boxMaterial.alpha = 1.0; // Ensure the material is fully opaque
        boxMaterial.backFaceCulling = false; // Make sure the box is visible from both sides
        box.material = boxMaterial;

        return box;
    };

    const updateShelf = () => {
        shelfContainer.forEach(box => box.dispose());
        shelfContainer = [];

        const capacity = Math.max(array.length, 2); // Ensure at least 2 capacity

        for (let i = 0; i < capacity; i++) {
            const box = createBoxWithColor(i);
            box.position.y = -2; // Position shelf boxes slightly lower
            shelfContainer.push(box);
        }
    };

    const updateVisualization = () => {
        boxContainer.forEach(box => box.dispose());
        boxContainer = [];

        // Update shelf to reflect current capacity
        updateShelf();
    };

    const handleAddElement = (element) => {
        array.push(element);
        updateVisualization();
        createThoughtBubble(`Added element`, new BABYLON.Vector3(0, 3, 0));
    };

    const handleRemoveElement = () => {
        array.pop();
        updateVisualization();
        createThoughtBubble(`Removed last element`, new BABYLON.Vector3(0, 3, 0));
    };

    const handleGrowArray = () => {
        const newCapacity = Math.max(array.length * 2, 2); // Double the capacity
        const newArray = new Array(newCapacity);

        for (let i = 0; i < array.length; i++) {
            newArray[i] = array[i];
        }

        array = newArray;
        updateVisualization();
        createThoughtBubble(`Array grown to capacity ${newCapacity}`, new BABYLON.Vector3(0, 3, 0));
    };

    const createThoughtBubble = (message, position) => {
        const thoughtBubble = BABYLON.MeshBuilder.CreatePlane("thoughtBubble", { width: 3, height: 1 }, scene);
        thoughtBubble.position = position;
        thoughtBubble.rotation = new BABYLON.Vector3(Math.PI, 0, 0);
        const thoughtTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(thoughtBubble);
        const thoughtText = new BABYLON.GUI.TextBlock();
        thoughtText.text = message;
        thoughtText.color = "white";
        thoughtText.fontSize = 24;
        thoughtTexture.addControl(thoughtText);
        setTimeout(() => thoughtBubble.dispose(), 2000); // Remove after 2 seconds
    };

    // GUI for buttons
    const buttonPlane = BABYLON.Mesh.CreatePlane("buttonPlane", 4, scene);
    buttonPlane.position = new BABYLON.Vector3(0, 4, 0);
    buttonPlane.rotation = new BABYLON.Vector3(Math.PI, 0, 0);
    const buttonTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(buttonPlane);
    const panel = new BABYLON.GUI.StackPanel();
    buttonTexture.addControl(panel);

    // Add element button
    const addButton = BABYLON.GUI.Button.CreateSimpleButton("addButton", "Add Element");
    addButton.width = "200px";
    addButton.height = "50px";
    addButton.color = "white";
    addButton.background = "green";
    addButton.onPointerUpObservable.add(() => {
        const element = prompt("Enter a number to add:");
        if (element !== null && !isNaN(element)) {
            handleAddElement(parseInt(element));
        }
    });
    panel.addControl(addButton);

    // Remove element button
    const removeButton = BABYLON.GUI.Button.CreateSimpleButton("removeButton", "Remove Element");
    removeButton.width = "200px";
    removeButton.height = "50px";
    removeButton.color = "white";
    removeButton.background = "red";
    removeButton.onPointerUpObservable.add(() => {
        handleRemoveElement();
    });
    panel.addControl(removeButton);

    // Grow array button
    const growButton = BABYLON.GUI.Button.CreateSimpleButton("growButton", "Grow Array");
    growButton.width = "200px";
    growButton.height = "50px";
    growButton.color = "white";
    growButton.background = "blue";
    growButton.onPointerUpObservable.add(() => {
        handleGrowArray();
    });
    panel.addControl(growButton);

    // Adding XR support
    const xrHelper = await scene.createDefaultXRExperienceAsync({
        uiOptions: { sessionMode: 'immersive-ar' },
    });

    return scene;
};

createScene().then(scene => {
    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener("resize", () => {
        engine.resize();
    });
}).catch(err => {
    console.error("Error creating scene:", err);
});

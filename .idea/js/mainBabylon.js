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
    let elementContainers = [];
    let shelfContainers = [];

    const peachColor = "#FFDAB9"; // Define the Peach color

    const createBoxWithColor = (index, size, color) => {
        // Create the box
        const box = BABYLON.MeshBuilder.CreateBox(`box${index}`, { size: size }, scene);
        box.position = new BABYLON.Vector3(index * 2, 0, 0);

        // Create the material
        const boxMaterial = new BABYLON.StandardMaterial(`boxMaterial${index}`, scene);
        boxMaterial.diffuseColor = BABYLON.Color3.FromHexString(color);
        boxMaterial.alpha = 1.0; // Ensure the material is fully opaque
        boxMaterial.backFaceCulling = false; // Make sure the box is visible from both sides
        box.material = boxMaterial;

        return box;
    };

    const updateShelf = () => {
        // Remove old shelf boxes
        shelfContainers.forEach(box => box.dispose());
        shelfContainers = [];

        // Determine the capacity
        const capacity = Math.max(array.length, 2); // Ensure at least 2 capacity

        for (let i = 0; i < capacity; i++) {
            const box = createBoxWithColor(i, 1, peachColor); // Same size for shelf boxes
            box.position.y = -2; // Position shelf boxes slightly lower
            shelfContainers.push(box);
        }
    };

    const updateVisualization = () => {
        // Remove old element boxes
        elementContainers.forEach(box => box.dispose());
        elementContainers = [];

        // Update shelf to reflect current capacity
        updateShelf();

        // Create new boxes for each array element
        array.forEach((element, index) => {
            const box = createBoxWithColor(index, 1, peachColor); // Same size as shelf boxes
            box.position.y = 0; // Position element boxes at the same level as shelf
            elementContainers.push(box);
        });
    };

    const handleAddElement = (element) => {
        array.push(element);
        updateVisualization();
        createThoughtBubble(`Added element: ${element}`, new BABYLON.Vector3(0, 3, 0));
    };

    const handleRemoveElement = () => {
        if (array.length > 0) {
            const removedElement = array.pop();
            updateVisualization();
            createThoughtBubble(`Removed element: ${removedElement}`, new BABYLON.Vector3(0, 3, 0));
        } else {
            createThoughtBubble("Array is empty. Cannot remove elements.", new BABYLON.Vector3(0, 3, 0));
        }
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
        const thoughtBubble = BABYLON.MeshBuilder.CreatePlane("thoughtBubble", { width: 5, height: 1.5 }, scene);
        thoughtBubble.position = position;
        thoughtBubble.rotation = new BABYLON.Vector3(Math.PI, 0, 0);
        const thoughtTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(thoughtBubble);
        const thoughtText = new BABYLON.GUI.TextBlock();
        thoughtText.text = message;
        thoughtText.color = "white";
        thoughtText.fontSize = 54;
        thoughtTexture.addControl(thoughtText);
        setTimeout(() => thoughtBubble.dispose(), 3000); // Remove after 3 seconds
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

    // Code visualization
    const codePlane = BABYLON.Mesh.CreatePlane("codePlane", 8, scene);
    codePlane.position = new BABYLON.Vector3(0, 2, -3);
    codePlane.rotation = new BABYLON.Vector3(0, Math.PI, 0);
    const codeTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(codePlane);
    const codeTextBlock = new BABYLON.GUI.TextBlock();
    codeTextBlock.text = "";
    codeTextBlock.color = "white";
    codeTextBlock.fontSize = 564;
    codeTextBlock.textWrapping = true;
    codeTexture.addControl(codeTextBlock);

    const updateCodeVisualization = (action) => {
        const codeText = `
class DynamicArray:
    def __init__(self):
        self.size = 0
        self.capacity = 2
        self.array = [None] * self.capacity

    def add(self, element):
        if self.size == self.capacity:
            self._grow()
        self.array[self.size] = element
        self.size += 1

    def _grow(self):
        new_capacity = self.capacity * 2
        new_array = [None] * new_capacity
        for i in range(self.size):
            new_array[i] = self.array[i]
        self.array = new_array
        self.capacity = new_capacity
        `;

        if (action === 'add') {
            codeText += `\n\n# Action: Adding an element\nself.add(element)`;
        } else if (action === 'remove') {
            codeText += `\n\n# Action: Removing an element\nself.remove()`;
        } else if (action === 'grow') {
            codeText += `\n\n# Action: Growing the array\nself._grow()`;
        }

        codeTextBlock.text = codeText;
    };

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

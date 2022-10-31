import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const renderWindow = vtkRenderWindow.newInstance();
const renderer = vtkRenderer.newInstance({ background: [0.2, 0.3, 0.4] });
renderWindow.addRenderer(renderer);

// ----------------------------------------------------------------------------
// Use OpenGL as the backend to view the all this
// ----------------------------------------------------------------------------

const openglRenderWindow = vtkOpenGLRenderWindow.newInstance();
renderWindow.addView(openglRenderWindow);

// ----------------------------------------------------------------------------
// Create a div section to put this into
// ----------------------------------------------------------------------------

const container = document.getElementById('#container');
openglRenderWindow.setContainer(container);

// ----------------------------------------------------------------------------
// Capture size of the container and set it to the renderWindow
// ----------------------------------------------------------------------------

const { width, height } = container.getBoundingClientRect();
openglRenderWindow.setSize(width, height);

// ----------------------------------------------------------------------------
// Setup an interactor to handle mouse events
// ----------------------------------------------------------------------------

const interactor = vtkRenderWindowInteractor.newInstance();
interactor.setView(openglRenderWindow);
interactor.initialize();
interactor.bindEvents(container);

// ----------------------------------------------------------------------------
// Setup interactor style to use
// ----------------------------------------------------------------------------

interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());

// ----------------------------------------------------------------------------
// Handle file input
// ----------------------------------------------------------------------------

export const load = (file) => {
  const vtiReader = vtkXMLImageDataReader.newInstance();
  vtiReader.parseAsArrayBuffer(file);

  const source = vtiReader.getOutputData(0);
  const mapper = vtkVolumeMapper.newInstance();
  const actor = vtkVolume.newInstance();

  const dataArray =
    source.getPointData().getScalars() || source.getPointData().getArrays()[0];
  const dataRange = dataArray.getRange();

  const lookupTable = vtkColorTransferFunction.newInstance();
  const piecewiseFunction = vtkPiecewiseFunction.newInstance();

  // Pipeline handling
  actor.setMapper(mapper);
  mapper.setInputData(source);
  renderer.addActor(actor);

  // Configuration
  const sampleDistance =
    0.7 *
    Math.sqrt(
      source
        .getSpacing()
        .map((v) => v * v)
        .reduce((a, b) => a + b, 0)
    );
  mapper.setSampleDistance(sampleDistance);
  actor.getProperty().setRGBTransferFunction(0, lookupTable);
  actor.getProperty().setScalarOpacity(0, piecewiseFunction);
  // actor.getProperty().setInterpolationTypeToFastLinear();
  actor.getProperty().setInterpolationTypeToLinear();

  // For better looking volume rendering
  // - distance in world coordinates a scalar opacity of 1.0
  actor
    .getProperty()
    .setScalarOpacityUnitDistance(
      0,
      vtkBoundingBox.getDiagonalLength(source.getBounds()) /
        Math.max(...source.getDimensions())
    );
  // - control how we emphasize surface boundaries
  //  => max should be around the average gradient magnitude for the
  //     volume or maybe average plus one std dev of the gradient magnitude
  //     (adjusted for spacing, this is a world coordinate gradient, not a
  //     pixel gradient)
  //  => max hack: (dataRange[1] - dataRange[0]) * 0.05
  actor.getProperty().setGradientOpacityMinimumValue(0, 0);
  actor
    .getProperty()
    .setGradientOpacityMaximumValue(0, (dataRange[1] - dataRange[0]) * 0.05);
  // - Use shading based on gradient
  actor.getProperty().setShade(true);
  actor.getProperty().setUseGradientOpacity(0, true);
  // - generic good default
  actor.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
  actor.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
  actor.getProperty().setAmbient(0.2);
  actor.getProperty().setDiffuse(0.7);
  actor.getProperty().setSpecular(0.3);
  actor.getProperty().setSpecularPower(8.0);

  // Control UI
  // const controllerWidget = vtkVolumeController.newInstance({
  //   size: [400, 150],
  //   rescaleColorMap: true,
  // });
  // const isBackgroundDark = background[0] + background[1] + background[2] < 1.5;
  // controllerWidget.setContainer(rootContainer);
  // controllerWidget.setupContent(renderWindow, actor, isBackgroundDark);

  // First render
  renderer.resetCamera();
  renderWindow.render();

  global.pipeline = {
    actor,
    renderer,
    renderWindow,
    lookupTable,
    mapper,
    source,
    piecewiseFunction,
    fullScreenRenderer,
  }
}

// ----------------------------------------------------------------------------
// Handle file input
// ----------------------------------------------------------------------------
const fileInput = document.getElementById('input');
fileInput.addEventListener('change', handleFile);
fileContainer.addEventListener('drop', handleFile);
fileContainer.addEventListener('click', (e) => fileInput.click());
console.log("FILE UPLOAD SUCCESSFUL. TRYING TO HANDLEFILE()")

const handleFile = () => {
  console.log("FILE UPLOAD SUCCESSFUL. TRYING TO HANDLEFILE()")
  const fileList = fileInput.files;
  for (var i = 0; i < fileList.length; ++i) {
    const file = fileList[i];

    const reader = new FileReader();
    reader.onload = () => {
      load(reader.result);
    };
    reader.readAsArrayBuffer(file);
  }
}
/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-extraneous-dependencies */

import '@kitware/vtk.js/favicon';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Volume';

import macro from '@kitware/vtk.js/macros';
import HttpDataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import vtkBoundingBox from '@kitware/vtk.js/Common/DataModel/BoundingBox';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkVolumeController from '@kitware/vtk.js/Interaction/UI/VolumeController';
import vtkURLExtract from '@kitware/vtk.js/Common/Core/URLExtract';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkXMLImageDataReader from '@kitware/vtk.js/IO/XML/XMLImageDataReader';
import vtkFPSMonitor from '@kitware/vtk.js/Interaction/UI/FPSMonitor';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';



// Force DataAccessHelper to have access to various data source
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import style from './VolumeViewer.module.css';
// var glsl = require('glslify')
let autoInit = true;
const userParams = vtkURLExtract.extractURLParameters();
const fpsMonitor = vtkFPSMonitor.newInstance();

// ----------------------------------------------------------------------------
// Add class to body if iOS device
// ----------------------------------------------------------------------------

const iOS = /iPad|iPhone|iPod/.test(window.navigator.platform);

var numFiles = 0;

document.body.style.backgroundColor = "black";

if (iOS) {
  document.querySelector('body').classList.add('is-ios-device');
}

// ----------------------------------------------------------------------------

function emptyContainer(container) {
  while (container != undefined && container.firstChild && container.firstChild.id != "first_div") {
    console.log("this is the containers child " + container.firstChild)
    console.log("this is the containers child id " + container.firstChild.id)
    container.removeChild(container.firstChild);

    // if(container.firstChild.id != "first_div"){
    //   container.removeChild(container.firstChild);
    // }
    
  }
  //console.log("this is the last container " + container.firstChild.id)

}

// ----------------------------------------------------------------------------
var index = 1;

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// ----------------------------------------------------------------------------
var play = true;
var container;
var slideBar;
var files;
var slider;
var output;
var sliderValue = 0;

function playfunc(){
  i = 0;
  console.log("play value ", play);
  myLoop(files);
}

function slidefunction(){
  console.log("slid ")
  options = { file: files[sliderValue - 1], ext, ...userParams };
  load(rootBody, options);
}

function createViewer(rootContainer, fileContents, options) {
  
  const background = options.background
    ? options.background.split(',').map((s) => Number(s))
    : [0, 0, 0];
  const containerStyle = options.containerStyle;

  const renderWindow = vtkRenderWindow.newInstance();
  const renderer = vtkRenderer.newInstance({ background: [0.2, 0.3, 0.4] });
  renderWindow.addRenderer(renderer);

  const vtiReader = vtkXMLImageDataReader.newInstance();


  const filelength = fileContents.length;
  console.log("fileeeee: "+ filelength);
  vtiReader.parseAsArrayBuffer(fileContents);

  const source = vtiReader.getOutputData(0);
  const mapper = vtkVolumeMapper.newInstance();
  // mapper.update();
  const actor = vtkVolume.newInstance();
  // actor.update();

  const dataArray =
    source.getPointData().getScalars() || source.getPointData().getArrays()[0];
  const dataRange = dataArray.getRange();

  const lookupTable = vtkColorTransferFunction.newInstance();
  // lookupTable.updateRange();
  const piecewiseFunction = vtkPiecewiseFunction.newInstance();
  // piecewiseFunction.updateRange();

  // Pipeline handling
  actor.setMapper(mapper);
  mapper.setInputData(source);
  renderer.addActor(actor);
  renderer.resetCamera();


  const openglRenderWindow = vtkOpenGLRenderWindow.newInstance();
  const playPauseButton = document.createElement("button");
  
  renderWindow.addView(openglRenderWindow);
  if(index == 1){
    console.log("index is 1")
    container = document.createElement('div');
    container.id = "first_div";
    document.body.appendChild(container);
    //document.querySelector('body').appendChild(container);
    playPauseButton.id = "playPauseButton";
    playPauseButton.innerHTML = "Play";
    playPauseButton.type = "button";
    playPauseButton.name = "playPauseButton";
    playPauseButton.style = "position: relative; color: green;";

    //playPauseButton.onclick = function(){"button clicked"};

    playPauseButton.addEventListener('click', playfunc);

    console.log("in create thing")
    document.body.appendChild(playPauseButton);
    
    const measureButton = document.createElement("button");
    measureButton.innerHTML = "Measure";
    measureButton.type = "button";
    measureButton.id = "measureButton";
    measureButton.name = "measureButton";
    measureButton.style = "position: relative";
    document.body.appendChild(measureButton);
    
    
    const uploadButton = document.createElement("input");
    uploadButton.innerHTML = "Upload";
    uploadButton.type = "button";
    uploadButton.name = "uploadButton";
    uploadButton.style = "position: relative";
    uploadButton.setAttribute("type", "file");
    uploadButton.setAttribute("multiple", "");
    //uploadButton.addEventListener('change', handleFile);
    document.body.appendChild(uploadButton);

    uploadButton.addEventListener('change', handleFile);

    slideBar = document.createElement("slidecontainer");
    console.log("num files: "+ numFiles);
    slideBar.innerHTML = `<div class="slidecontainer"/><input type="range" min="1" max="${numFiles}" class="slider" id="myRange">`;
    slideBar.addEventListener('click', slidefunction);

    document.body.appendChild(slideBar);

    slider = document.getElementById("myRange");
    output = document.createElement("demo");
    output.innerHTML =  numFiles;
    slider.oninput = function() {
      output.innerHTML = this.value;

      sliderValue = this.value;
      output.style.color = "white";
      console.log(sliderValue)
    }
    slider.style = "position: relative; clear: both";
    document.body.appendChild(output);
      
    index+=1;
  }
  else{
    console.log("index is not 1")
    container = document.getElementById("first_div");
    console.log("id: "+ container.id)

    
  }
  emptyContainer(container);

  openglRenderWindow.setContainer(container);
  const { width, height } = container.getBoundingClientRect();
  openglRenderWindow.setSize(width, height);


const interactor = vtkRenderWindowInteractor.newInstance();
interactor.setView(openglRenderWindow);
interactor.initialize();
interactor.bindEvents(container);

interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());

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
  const controllerWidget = vtkVolumeController.newInstance({
    size: [400, 150],
    rescaleColorMap: true,
  });
  const isBackgroundDark = background[0] + background[1] + background[2] < 1.5;
  controllerWidget.setContainer(rootContainer);
  controllerWidget.setupContent(renderWindow, actor, isBackgroundDark);

  // setUpContent above sets the size to the container.
  // We need to set the size after that.

  // First render
  renderer.resetCamera();
  renderWindow.ren
  renderWindow.render();

  global.pipeline = {
    actor,
    renderer,
    renderWindow,
    lookupTable,
    mapper,
    source,
    piecewiseFunction,
  };

  if (userParams.fps) {
    const fpsElm = fpsMonitor.getFpsMonitorContainer();
    fpsElm.classList.add(style.fpsMonitor);
    fpsMonitor.setRenderWindow(renderWindow);
    fpsMonitor.setContainer(rootContainer);
    fpsMonitor.update();
  }
}

// ----------------------------------------------------------------------------
var rootBody;
export function load(container, options) {
  autoInit = false;
  emptyContainer(container);

  if (options.file) {
    if (options.ext === 'vti') {
      const reader = new FileReader();
      reader.onload = function onLoad(e) {
        createViewer(container, reader.result, options);
      };
      reader.readAsArrayBuffer(options.file);
    } else {
      console.error('Unkown file...');
    }
  } else if (options.fileURL) {
    // const progressContainer = document.createElement('div');
    // progressContainer.setAttribute('class', style.progress);
    container.setAttribute('class', style.progress); //added
    // container.appendChild(progressContainer);

    const progressCallback = (progressEvent) => {
      if (progressEvent.lengthComputable) {
        const percent = Math.floor(
          (100 * progressEvent.loaded) / progressEvent.total
        );
        // progressContainer.innerHTML = `Loading ${percent}%`;
        container.innerHTML = `Loading ${percent}%`; //added
      } else {
        // progressContainer.innerHTML = macro.formatBytesToProperUnit(
        container.innerHTML = macro.formatBytesToProperUnit(
          progressEvent.loaded
        );
      }
    };

    HttpDataAccessHelper.fetchBinary(options.fileURL, {
      progressCallback,
    }).then((binary) => {
      
      // container.removeChild(progressContainer);
      createViewer(container, binary, options);
    });
  }
}

export function initLocalFileLoader(container) {

  const exampleContainer = document.querySelector('.content');
  rootBody = document.querySelector('body');
  const myContainer = container || exampleContainer || rootBody;

  const fileContainer = document.createElement('div');
  fileContainer.innerHTML = `<div class="${style.bigFileDrop}"/><input type="file" accept=".vti" style="display: none;"/>`;
  myContainer.appendChild(fileContainer);

  const fileInput = fileContainer.querySelector('input');
  fileInput.setAttribute("multiple", "");
  console.log("file input", fileInput)    

  fileInput.addEventListener('change', handleFile);
  fileContainer.addEventListener('drop', handleFile);
  fileContainer.addEventListener('click', (e) => fileInput.click());
  fileContainer.addEventListener('dragover', preventDefaults);
}

function handleFile(e) {
  preventDefaults(e);
  const dataTransfer = e.dataTransfer;
  files = e.target.files || dataTransfer.files;
  console.log("file length: " + files.length);
  numFiles = files.length;
  console.log("numFiles: " + numFiles);
  myLoop(files);
  slideBar.innerHTML = `<div class="slidecontainer"/><input type="range" min="1" max="${numFiles}" class="slider" id="myRange">`;
  output.innerHTML =  this.value;
  
  
}


if (userParams.fileURL) {
  const exampleContainer = document.querySelector('.content');
  rootBody = document.querySelector('body');
  const myContainer = exampleContainer || rootBody;
  load(myContainer, userParams);
}

const viewerContainers = document.querySelectorAll('.vtkjs-volume-viewer');
let nbViewers = viewerContainers.length;
console.log("nbviewers: " + nbViewers);
while (nbViewers--) {
  
  const viewerContainer = viewerContainers[nbViewers];
  const fileURL = viewerContainer.dataset.url;
  const options = {
    containerStyle: { height: '100%' },
    ...userParams,
    fileURL,
  };
  load(viewerContainer, options);
}

// Auto setup if no method get called within 100ms
setTimeout(() => {
  if (autoInit) {
    console.log("init loaded");
    initLocalFileLoader();
  }
}, 100);



var i = -1;
var ext;
var options;


function myLoop(files) {       
  setTimeout(function() {   
    
    i++;
    console.log("test ", i)                   
    if (i < files.length) {          
      ext = files[i].name.split('.').slice(-1)[0];
      console.log(files[i])
      options = { file: files[i], ext, ...userParams };

      load(rootBody, options);
      myLoop(files);             
    }                      
  }, 1000)
}  
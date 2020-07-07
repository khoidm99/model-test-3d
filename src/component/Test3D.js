import React, { useState, useRef, useEffect } from 'react';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function Test3D() {
	const [scene, setScene] = useState(new THREE.Scene());
	const [control, setControl] = useState(null);
	const sceneRef = useRef(null);
	const videoRef = useRef(null);

	// useEffect(() => {
	// 	videoRef.current.play();
	// 	videoRef.current.load();
	// });

	function handleCanPlay() {
		videoRef.current.play();
	}

	function handleCanLoad() {
		videoRef.current.load();
	}

	useEffect(() => {}, []);

	useEffect(() => {
		let width = sceneRef.current.clientWidth;
		let height = sceneRef.current.clientHeight;
		let frameId;

		let camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		const renderer = new THREE.WebGLRenderer({
			antialias: true,
		});

		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshBasicMaterial({
			color: 0xff00ff,
		});

		const cube = new THREE.Mesh(geometry, material);
		camera.position.z = 4;
		scene.add(cube);

		// videoRef.current.src = 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4';
		// videoRef.current.play();
		// videoRef.current.load();

		videoRef.current.src = 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4';
		let videoTexture = new THREE.VideoTexture(videoRef);

		videoTexture.minFilter = THREE.LinearFilter;
		videoTexture.magFilter = THREE.LinearFilter;

		let movieMaterial = new THREE.MeshBasicMaterial({
			map: videoTexture,
			overdraw: 0.5,
			side: THREE.DoubleSide,
		});
		let movieGeometry = new THREE.PlaneGeometry(240, 100, 4, 4);
		let movieScreen = new THREE.Mesh(movieGeometry, movieMaterial);
		movieScreen.position.set(0, 50, 0);

		camera.position.set(0, 150, 300);
		camera.lookAt(movieScreen.position);

		let loader = new GLTFLoader();
		loader.crossOrigin = true;
		loader.load('http://localhost:3000/scene.glb', function (data) {
			let object = data.scene;

			if (data.cameras.length > 0) {
				camera = data.cameras[0];
			}

			object.position.set(0, -10, -0.75);

			object.traverse(function (child) {
				if (child instanceof THREE.Mesh) {
					if (child.name === 'Banner-01') {
						child.material = movieMaterial;
					}
				}
			});

			scene.add(object);
			setControl(new OrbitControls(camera, renderer.domElement));
		});

		let alight = new THREE.AmbientLight(0x404040);
		let light = new THREE.PointLight(0xffffcc, 20, 200);
		let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
		light.position.set(4, 30, -20);
		scene.add(light);
		scene.add(alight);
		scene.add(directionalLight);
		renderer.setClearColor('#ccc');
		renderer.setSize(width, height);

		const renderScene = () => {
			renderer.render(scene, camera);
		};

		const handleResize = () => {
			// videoImage.width = videoRef.current.videoWidth;
			// videoImage.height = videoRef.current.videoHeight;
			width = sceneRef.current.clientWidth;
			height = sceneRef.current.clientHeight;
			renderer.setSize(width, height);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderScene();
		};

		const animate = () => {
			// cube.rotation.x += 0.01;
			// cube.rotation.y += 0.01;
			// control.update()
			renderScene();
			frameId = window.requestAnimationFrame(animate);
		};

		const start = () => {
			if (!frameId) {
				frameId = requestAnimationFrame(animate);
			}
		};

		const stop = () => {
			cancelAnimationFrame(frameId);
			frameId = null;
		};
		videoRef.current.appendChild(renderer.domElement);
		sceneRef.current.appendChild(renderer.domElement);
		window.addEventListener('resize', handleResize);
		start();

		// control.current = { start, stop }
		return () => {
			stop();
			window.removeEventListener('resize', handleResize);
			videoRef.current.appendChild(renderer.domElement);
			sceneRef.current.removeChild(renderer.domElement);

			scene.remove(cube);
			geometry.dispose();
			material.dispose();
		};
	}, []);
	return (
		<div>
			<div
				style={{
					height: '800px',
				}}
				ref={sceneRef}>
				<video
					ref={videoRef}
					onCanPlay={() => handleCanPlay}
					onLoad={() => handleCanLoad}
					controls
					autoPlay
					playsInline></video>
			</div>
		</div>
	);
}

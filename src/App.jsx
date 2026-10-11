import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ArrowDown, ArrowRight, Dna, Heart, Menu, Microscope, Play, ShieldCheck, Users, X } from "lucide-react";

const chapters = [
  {
    id: "home", number: "01", tone: "dark", eyebrow: "GENETIC INSIGHTS FOR A BRIGHTER TOMORROW",
    title: <>Your genes<br />hold a <em>story.</em></>,
    body: "Understand what makes you, you. Thoughtful genetic guidance for a healthier life and the generations ahead.",
    action: "Book a consultation", noteTitle: <>Complex<br />information</>,
    note: "Your genetic data can be complex. Understanding it does not have to be."
  },
  {
    id: "services", number: "02", tone: "ocean", eyebrow: "GENETIC TESTING",
    title: <>Turn complexity<br />into <em>clarity.</em></>,
    body: "Carefully selected testing and expert interpretation turn your DNA into information you can use.",
    action: "Explore our tests", noteTitle: <>Analysis<br />in progress</>,
    note: "We look beyond the data to focus on what matters to you."
  },
  {
    id: "about", number: "03", tone: "ice", eyebrow: "GENETIC COUNSELING",
    title: <>Guidance<br /><em>you can trust.</em></>,
    body: "Talk through your results with a qualified counselor who makes space for your questions and your story.",
    action: "Meet our experts", noteTitle: <>Connecting<br />the dots</>,
    note: "Understand what genetic information may mean for you and your family."
  },
  {
    id: "process", number: "04", tone: "pearl", eyebrow: "PERSONALIZED INSIGHTS",
    title: <>Make insight<br /><em>actionable.</em></>,
    body: "Bring your genetic information into clear, personal conversations about health, wellness, and family planning.",
    action: "Our approach", noteTitle: <>A clearer picture</>,
    note: "Your genetic story comes to life with clear, considered next steps."
  },
  {
    id: "future", number: "05", tone: "sunrise", eyebrow: "A BRIGHTER TOMORROW",
    title: <>Your heritage.<br /><em>A healthier future.</em></>,
    body: "Together, we can explore your genetic story and make informed decisions for you and the people who come after.",
    action: "Book a consultation", noteTitle: <>A stronger<br />tomorrow</>,
    note: "Knowledge today can help shape a healthier future for generations."
  }
];

function makeHelix() {
  const beadCount = 540;
  const rungCount = 74;
  const turns = 7.2;
  const height = 42;
  const radius = 0.9;
  const strandA = new Float32Array(beadCount * 3);
  const strandB = new Float32Array(beadCount * 3);
  const startA = new Float32Array(beadCount * 3);
  const startB = new Float32Array(beadCount * 3);
  const rungs = new Float32Array(rungCount * 6);
  const startRungs = new Float32Array(rungCount * 6);
  const noise = (seed) => {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  };

  for (let index = 0; index < beadCount; index++) {
    const progress = index / (beadCount - 1);
    const angle = progress * Math.PI * 2 * turns;
    const y = (progress - 0.5) * height;
    const offset = index * 3;
    strandA.set([Math.cos(angle) * radius, y, Math.sin(angle) * radius], offset);
    strandB.set([Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius], offset);
    startA.set([(noise(index + 1) - 0.5) * 13, y + (noise(index + 1200) - 0.5) * 7, (noise(index + 2400) - 0.5) * 5.5], offset);
    startB.set([(noise(index + 3600) - 0.5) * 13, y + (noise(index + 4800) - 0.5) * 7, (noise(index + 6000) - 0.5) * 5.5], offset);
  }

  for (let index = 0; index < rungCount; index++) {
    const progress = index / (rungCount - 1);
    const angle = progress * Math.PI * 2 * turns;
    const y = (progress - 0.5) * height;
    const offset = index * 6;
    rungs.set([Math.cos(angle) * radius, y, Math.sin(angle) * radius], offset);
    rungs.set([Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius], offset + 3);
    startRungs.set([(noise(index + 7200) - 0.5) * 14, y + (noise(index + 8400) - 0.5) * 9, (noise(index + 9600) - 0.5) * 6], offset);
    startRungs.set([(noise(index + 10800) - 0.5) * 14, y + (noise(index + 12000) - 0.5) * 9, (noise(index + 13200) - 0.5) * 6], offset + 3);
  }

  return { beadCount, rungCount, strandA, strandB, startA, startB, rungs, startRungs };
}

function makeDust() {
  const count = 900;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const blue = new THREE.Color("#70d4f2");
  const amber = new THREE.Color("#ffc477");

  for (let index = 0; index < count; index++) {
    const seed = index + 1;
    const noise = (value) => {
      const result = Math.sin(value * 127.1 + 311.7) * 43758.5453;
      return result - Math.floor(result);
    };
    const offset = index * 3;
    positions.set([
      (noise(seed) - 0.5) * 4.7,
      (noise(seed * 2) - 0.5) * 43,
      (noise(seed * 3) - 0.5) * 2.2
    ], offset);
    const color = index % 3 === 0 ? amber : blue;
    colors.set([color.r, color.g, color.b], offset);
  }

  return { positions, colors };
}

function DNAHelix({ scrollProgress }) {
  const group = useRef();
  const beadsA = useRef();
  const beadsB = useRef();
  const railsA = useRef();
  const railsB = useRef();
  const rungs = useRef();
  const beadMaterialA = useRef();
  const beadMaterialB = useRef();
  const railMaterialA = useRef();
  const railMaterialB = useRef();
  const rungMaterial = useRef();
  const viewport = useThree((state) => state.viewport);
  const helix = useMemo(makeHelix, []);
  const dust = useMemo(makeDust, []);
  const matrixHelper = useMemo(() => new THREE.Object3D(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const pointStart = useMemo(() => new THREE.Vector3(), []);
  const pointEnd = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);

  useLayoutEffect(() => {
    const up = new THREE.Vector3(0, 1, 0);
    const start = new THREE.Vector3();
    const end = new THREE.Vector3();
    const direction = new THREE.Vector3();

    const setBeads = (mesh, positions) => {
      for (let index = 0; index < helix.beadCount; index++) {
        matrixHelper.position.fromArray(positions, index * 3);
        matrixHelper.scale.setScalar(0.078);
        matrixHelper.quaternion.identity();
        matrixHelper.updateMatrix();
        mesh.setMatrixAt(index, matrixHelper.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    };

    const setLinks = (mesh, positions, count, radius) => {
      for (let index = 0; index < count; index++) {
        const offset = index * 3;
        start.fromArray(positions, offset);
        end.fromArray(positions, offset + 3);
        direction.subVectors(end, start);
        const length = direction.length();
        matrixHelper.position.addVectors(start, end).multiplyScalar(0.5);
        matrixHelper.quaternion.setFromUnitVectors(up, direction.normalize());
        matrixHelper.scale.set(radius, length, radius);
        matrixHelper.updateMatrix();
        mesh.setMatrixAt(index, matrixHelper.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    };

    setBeads(beadsA.current, helix.strandA);
    setBeads(beadsB.current, helix.strandB);
    setLinks(railsA.current, helix.strandA, helix.beadCount - 1, 0.012);
    setLinks(railsB.current, helix.strandB, helix.beadCount - 1, 0.012);

    for (let index = 0; index < helix.rungCount; index++) {
      const offset = index * 6;
      start.fromArray(helix.rungs, offset);
      end.fromArray(helix.rungs, offset + 3);
      direction.subVectors(end, start);
      const length = direction.length();
      matrixHelper.position.addVectors(start, end).multiplyScalar(0.5);
      matrixHelper.quaternion.setFromUnitVectors(up, direction.normalize());
      matrixHelper.scale.set(0.009, length, 0.009);
      matrixHelper.updateMatrix();
      rungs.current.setMatrixAt(index, matrixHelper.matrix);
    }
    rungs.current.instanceMatrix.needsUpdate = true;
    rungs.current.computeBoundingSphere();
  }, [helix, matrixHelper]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const progress = THREE.MathUtils.clamp(scrollProgress.current, 0, 1);
    const assembly = THREE.MathUtils.clamp(progress / 0.75, 0, 1);
    const easedAssembly = assembly * assembly * (3 - 2 * assembly);

    if (easedAssembly < 1) {
      beadMaterialA.current.opacity = 0.48 + easedAssembly * 0.52;
      beadMaterialB.current.opacity = 0.48 + easedAssembly * 0.52;
      railMaterialA.current.opacity = 0.14 + easedAssembly * 0.86;
      railMaterialB.current.opacity = 0.14 + easedAssembly * 0.86;
      rungMaterial.current.opacity = 0.28 + easedAssembly * 0.72;

      for (let index = 0; index < helix.beadCount; index++) {
        const offset = index * 3;
        matrixHelper.position.set(
          THREE.MathUtils.lerp(helix.startA[offset], helix.strandA[offset], easedAssembly),
          THREE.MathUtils.lerp(helix.startA[offset + 1], helix.strandA[offset + 1], easedAssembly),
          THREE.MathUtils.lerp(helix.startA[offset + 2], helix.strandA[offset + 2], easedAssembly)
        );
        matrixHelper.scale.setScalar(THREE.MathUtils.lerp(0.028, 0.078, easedAssembly));
        matrixHelper.quaternion.identity();
        matrixHelper.updateMatrix();
        beadsA.current.setMatrixAt(index, matrixHelper.matrix);

        matrixHelper.position.set(
          THREE.MathUtils.lerp(helix.startB[offset], helix.strandB[offset], easedAssembly),
          THREE.MathUtils.lerp(helix.startB[offset + 1], helix.strandB[offset + 1], easedAssembly),
          THREE.MathUtils.lerp(helix.startB[offset + 2], helix.strandB[offset + 2], easedAssembly)
        );
        matrixHelper.updateMatrix();
        beadsB.current.setMatrixAt(index, matrixHelper.matrix);
      }
      beadsA.current.instanceMatrix.needsUpdate = true;
      beadsB.current.instanceMatrix.needsUpdate = true;

      for (const [mesh, startPositions, endPositions] of [
        [railsA.current, helix.startA, helix.strandA],
        [railsB.current, helix.startB, helix.strandB]
      ]) {
        for (let index = 0; index < helix.beadCount - 1; index++) {
          const offset = index * 3;
          pointStart.set(
            THREE.MathUtils.lerp(startPositions[offset], endPositions[offset], easedAssembly),
            THREE.MathUtils.lerp(startPositions[offset + 1], endPositions[offset + 1], easedAssembly),
            THREE.MathUtils.lerp(startPositions[offset + 2], endPositions[offset + 2], easedAssembly)
          );
          pointEnd.set(
            THREE.MathUtils.lerp(startPositions[offset + 3], endPositions[offset + 3], easedAssembly),
            THREE.MathUtils.lerp(startPositions[offset + 4], endPositions[offset + 4], easedAssembly),
            THREE.MathUtils.lerp(startPositions[offset + 5], endPositions[offset + 5], easedAssembly)
          );
          direction.subVectors(pointEnd, pointStart);
          const length = direction.length();
          matrixHelper.position.addVectors(pointStart, pointEnd).multiplyScalar(0.5);
          matrixHelper.quaternion.setFromUnitVectors(up, direction.normalize());
          const radius = THREE.MathUtils.lerp(0.004, 0.012, easedAssembly);
          matrixHelper.scale.set(radius, length, radius);
          matrixHelper.updateMatrix();
          mesh.setMatrixAt(index, matrixHelper.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      }

      for (let index = 0; index < helix.rungCount; index++) {
        const offset = index * 6;
        pointStart.set(
          THREE.MathUtils.lerp(helix.startRungs[offset], helix.rungs[offset], easedAssembly),
          THREE.MathUtils.lerp(helix.startRungs[offset + 1], helix.rungs[offset + 1], easedAssembly),
          THREE.MathUtils.lerp(helix.startRungs[offset + 2], helix.rungs[offset + 2], easedAssembly)
        );
        pointEnd.set(
          THREE.MathUtils.lerp(helix.startRungs[offset + 3], helix.rungs[offset + 3], easedAssembly),
          THREE.MathUtils.lerp(helix.startRungs[offset + 4], helix.rungs[offset + 4], easedAssembly),
          THREE.MathUtils.lerp(helix.startRungs[offset + 5], helix.rungs[offset + 5], easedAssembly)
        );
        direction.subVectors(pointEnd, pointStart);
        const length = direction.length();
        matrixHelper.position.addVectors(pointStart, pointEnd).multiplyScalar(0.5);
        matrixHelper.quaternion.setFromUnitVectors(up, direction.normalize());
        const radius = THREE.MathUtils.lerp(0.004, 0.009, easedAssembly);
        matrixHelper.scale.set(radius, length, radius);
        matrixHelper.updateMatrix();
        rungs.current.setMatrixAt(index, matrixHelper.matrix);
      }
      rungs.current.instanceMatrix.needsUpdate = true;
    }

    group.current.rotation.y = clock.elapsedTime * 0.34 + progress * 0.8;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.16) * 0.045;
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.12) * 0.025;
    group.current.position.y = (progress - 0.5) * (42 - viewport.height);
    group.current.position.x = viewport.width < 12 ? 1.8 : 0;
    group.current.scale.x = viewport.width < 12 ? 0.72 : 1;
  });

  return (
    <group ref={group}>
      <points position={[0, 0, -0.35]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dust.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.038} sizeAttenuation vertexColors transparent opacity={0.78} depthWrite={false} />
      </points>
      <instancedMesh ref={railsA} args={[undefined, undefined, helix.beadCount - 1]}>
        <cylinderGeometry args={[1, 1, 1, 12]} />
        <meshPhysicalMaterial ref={railMaterialA} color="#117eae" roughness={0.27} metalness={0.15} clearcoat={0.8} transparent />
      </instancedMesh>
      <instancedMesh ref={railsB} args={[undefined, undefined, helix.beadCount - 1]}>
        <cylinderGeometry args={[1, 1, 1, 12]} />
        <meshPhysicalMaterial ref={railMaterialB} color="#075e80" roughness={0.24} metalness={0.18} clearcoat={0.9} transparent />
      </instancedMesh>
      <instancedMesh ref={rungs} args={[undefined, undefined, helix.rungCount]}>
        <cylinderGeometry args={[1, 1, 1, 12]} />
        <meshPhysicalMaterial ref={rungMaterial} color="#efa94f" roughness={0.3} metalness={0.12} clearcoat={0.65} transparent />
      </instancedMesh>
      <instancedMesh ref={beadsA} args={[undefined, undefined, helix.beadCount]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshPhysicalMaterial ref={beadMaterialA} color="#129bd4" roughness={0.22} metalness={0.1} clearcoat={1} clearcoatRoughness={0.16} transparent />
      </instancedMesh>
      <instancedMesh ref={beadsB} args={[undefined, undefined, helix.beadCount]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshPhysicalMaterial ref={beadMaterialB} color="#08769a" roughness={0.2} metalness={0.13} clearcoat={1} clearcoatRoughness={0.16} transparent />
      </instancedMesh>
    </group>
  );
}

function DNAStage({ scrollProgress }) {
  return (
    <div className="canvas-fixed" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 14], fov: 38 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
        <ambientLight intensity={1.45} />
        <directionalLight position={[4, 5, 7]} intensity={3.2} color="#eaf8ff" />
        <pointLight position={[-3, 2, 4]} intensity={38} color="#46bde9" distance={18} />
        <pointLight position={[3, -3, 3]} intensity={28} color="#ffb35e" distance={16} />
        <DNAHelix scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}

export default function App() {
  const scrollProgress = useRef(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateScroll = () => {
      scrollProgress.current = THREE.MathUtils.clamp(window.scrollY / (window.innerHeight * chapters.length), 0, 1);
      const chapterElements = document.querySelectorAll(".chapter");
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      chapterElements.forEach((element, index) => {
        const bounds = element.getBoundingClientRect();
        const distance = Math.abs(bounds.top + bounds.height / 2 - window.innerHeight / 2);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      setActiveChapter(nearestIndex);
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="DCode Heritage home"><Dna size={29} strokeWidth={1.35} /><span>DCode Heritage</span></a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={menuOpen ? "site-nav is-open" : "site-nav"} aria-label="Main navigation">
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#services" onClick={closeMenu}>Services</a>
          <a href="#process" onClick={closeMenu}>Process</a>
          <a href="#faqs" onClick={closeMenu}>FAQs</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
        </nav>
        <a className="header-cta" href="#contact">Book a consultation <ArrowRight size={16} /></a>
      </header>

      <DNAStage scrollProgress={scrollProgress} />

      <main className="story">
        {chapters.map((chapter, index) => (
          <section className={`chapter chapter--${chapter.tone}`} id={chapter.id} key={chapter.id}>
            <div className="chapter-copy">
              <span className="eyebrow">{chapter.eyebrow}</span>
              <h1>{chapter.title}</h1>
              <p>{chapter.body}</p>
              <div className="chapter-actions">
                <a className={index === chapters.length - 1 ? "pill pill--dark" : "pill"} href="#contact">{chapter.action}<ArrowRight size={16} /></a>
                {index === 0 && <a className="watch-link" href="#process"><span><Play size={12} fill="currentColor" /></span>How it works</a>}
              </div>
            </div>
            <aside className="chapter-note"><span className="note-rule" /><div><h2>{chapter.noteTitle}</h2><p>{chapter.note}</p></div></aside>
            <div className="chapter-progress" aria-label={`Chapter ${chapter.number} of 05`}>
              <span className="chapter-number">{chapter.number}</span>
              <span className="progress-track"><i style={{ transform: `scaleY(${activeChapter === index ? 1 : 0})` }} /></span>
              {index === 0 && <a className="scroll-cue" href="#services" aria-label="Scroll to explore"><span>Scroll to explore</span><ArrowDown size={17} /></a>}
            </div>
          </section>
        ))}
      </main>

      <section className="trust-strip" aria-label="Our commitments">
        <div><ShieldCheck /><span><b>Expert counselors</b><small>Qualified professionals</small></span></div>
        <div><Microscope /><span><b>Advanced testing</b><small>Accurate and reliable</small></span></div>
        <div><Heart /><span><b>Personalized care</b><small>Tailored to your needs</small></span></div>
        <div><Users /><span><b>Better futures</b><small>For you and generations</small></span></div>
      </section>

      <section className="faq-section" id="faqs">
        <div className="faq-heading"><span className="eyebrow">GOOD TO KNOW</span><h2>Questions,<br /><em>answered.</em></h2></div>
        <div className="faq-list">
          <details><summary>What is genetic counseling?</summary><p>Genetic counseling helps people understand genetic conditions, inherited risks, and the implications of genetic testing.</p></details>
          <details><summary>Does everyone need genetic testing?</summary><p>No. Whether testing is appropriate depends on personal circumstances and is best discussed with a qualified healthcare professional.</p></details>
          <details><summary>How can I book a consultation?</summary><p>Get in touch with our team to talk through your questions and learn about consultation options.</p></details>
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <a className="brand" href="#home"><Dna size={27} strokeWidth={1.35} /><span>DCode Heritage</span></a>
        <p>Genetic insights for a brighter tomorrow.</p>
        <a href="mailto:hello@DCode Heritage.com">hello@DCode Heritage.com</a>
        <small>© {new Date().getFullYear()} DCode Heritage</small>
      </footer>
    </div>
  );
}
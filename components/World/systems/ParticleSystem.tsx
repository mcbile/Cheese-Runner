/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Particle system for visual effects (explosions, pickups, etc.)
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PARTICLE_COUNT } from '../geometries';
import { ParticleBurstEvent, GameEvents } from '../../../types';

interface Particle {
    life: number;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    rot: THREE.Vector3;
    rotVel: THREE.Vector3;
    color: THREE.Color;
}

export const ParticleSystem: React.FC = () => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Use ref instead of state to avoid re-renders and ensure stable reference
    const particlesRef = useRef<Particle[]>(
        new Array(PARTICLE_COUNT).fill(0).map(() => ({
            life: 0,
            pos: new THREE.Vector3(),
            vel: new THREE.Vector3(),
            rot: new THREE.Vector3(),
            rotVel: new THREE.Vector3(),
            color: new THREE.Color()
        }))
    );

    useEffect(() => {
        const particles = particlesRef.current;

        const handleExplosion = (e: ParticleBurstEvent) => {
            const { position, color, amount = 40, intensity = 1 } = e.detail;
            let spawned = 0;
            const burstAmount = Math.min(amount, 60); // Cap at 60 for performance

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const p = particles[i];
                if (p.life <= 0) {
                    p.life = 1.0 + Math.random() * 0.5;
                    p.pos.set(position[0], position[1], position[2]);
                    p.vel.set(
                        (Math.random() - 0.5) * 8 * intensity,
                        Math.random() * 8 * intensity,
                        (Math.random() - 0.5) * 8 * intensity
                    );
                    p.rot.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                    p.rotVel.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(5);
                    p.color.set(color);
                    spawned++;
                    if (spawned >= burstAmount) break;
                }
            }
        };

        const handler = handleExplosion as EventListener;
        window.addEventListener(GameEvents.PARTICLE_BURST, handler);
        return () => window.removeEventListener(GameEvents.PARTICLE_BURST, handler);
    }, []); // Empty deps - particles ref is stable

    useFrame((_, delta) => {
        if (!mesh.current) return;
        const safeDelta = Math.min(delta, 0.1);
        const particles = particlesRef.current;

        particles.forEach((p, i) => {
            if (p.life > 0) {
                p.life -= safeDelta * 1.5;
                p.pos.addScaledVector(p.vel, safeDelta);
                p.vel.y -= safeDelta * 5;
                p.vel.multiplyScalar(0.98);
                p.rot.x += p.rotVel.x * safeDelta;
                p.rot.y += p.rotVel.y * safeDelta;
                dummy.position.copy(p.pos);
                const scale = Math.max(0, p.life * 0.25);
                dummy.scale.set(scale, scale, scale);
                dummy.rotation.set(p.rot.x, p.rot.y, p.rot.z);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
                mesh.current!.setColorAt(i, p.color);
            } else {
                dummy.scale.set(0, 0, 0);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
            }
        });

        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, PARTICLE_COUNT]} frustumCulled={false}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshBasicMaterial toneMapped={false} transparent opacity={0.9} />
        </instancedMesh>
    );
};

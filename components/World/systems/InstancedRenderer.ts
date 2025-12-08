/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Instanced Renderer - Batches similar objects for efficient GPU rendering
 * Uses THREE.InstancedMesh for objects that share the same geometry/material
 */

import * as THREE from 'three';
import { GameObject, ObjectType } from '../../../types';

// Maximum instances per batch
const MAX_INSTANCES = 100;

export interface InstancedBatch {
    mesh: THREE.InstancedMesh;
    count: number;
    type: ObjectType;
}

/**
 * Create an instanced mesh batch for a specific object type
 */
export function createInstancedBatch(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    type: ObjectType,
    maxCount: number = MAX_INSTANCES
): InstancedBatch {
    const mesh = new THREE.InstancedMesh(geometry, material, maxCount);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;

    return {
        mesh,
        count: 0,
        type
    };
}

/**
 * Update instanced batch with current object positions
 */
export function updateInstancedBatch(
    batch: InstancedBatch,
    objects: GameObject[],
    matrix: THREE.Matrix4 = new THREE.Matrix4()
): void {
    const filteredObjects = objects.filter(o => o.type === batch.type && o.active);
    batch.count = Math.min(filteredObjects.length, MAX_INSTANCES);

    for (let i = 0; i < batch.count; i++) {
        const obj = filteredObjects[i];
        matrix.setPosition(obj.position[0], obj.position[1], obj.position[2]);
        batch.mesh.setMatrixAt(i, matrix);
    }

    // Hide unused instances by scaling to 0
    const zeroMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
    for (let i = batch.count; i < MAX_INSTANCES; i++) {
        batch.mesh.setMatrixAt(i, zeroMatrix);
    }

    batch.mesh.instanceMatrix.needsUpdate = true;
    batch.mesh.count = batch.count;
}

/**
 * Shared materials for instanced objects (created once)
 */
export const instancedMaterials = {
    projectile: new THREE.MeshBasicMaterial({
        color: 0x34D399,
        transparent: true,
        opacity: 0.9
    }),
    projectileFirewall: new THREE.MeshBasicMaterial({
        color: 0xFF6B00,
        transparent: true,
        opacity: 0.9
    }),
    shadow: new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.3
    })
};

/**
 * Helper to efficiently count objects by type
 */
export function countObjectsByType(objects: GameObject[]): Map<ObjectType, number> {
    const counts = new Map<ObjectType, number>();

    for (const obj of objects) {
        if (obj.active) {
            counts.set(obj.type, (counts.get(obj.type) || 0) + 1);
        }
    }

    return counts;
}

/**
 * Get rendering statistics for debugging
 */
export function getRenderStats(objects: GameObject[]): {
    totalActive: number;
    byType: Record<string, number>;
} {
    const counts = countObjectsByType(objects);
    const byType: Record<string, number> = {};

    let totalActive = 0;
    counts.forEach((count, type) => {
        byType[type] = count;
        totalActive += count;
    });

    return { totalActive, byType };
}

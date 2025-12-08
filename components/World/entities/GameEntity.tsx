/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Unified GameEntity component that delegates rendering to specialized entity modules.
 * Handles cheese fever visual replacement and routes to appropriate entity renderer.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float } from '@react-three/drei';
import { GameObject, ObjectType, GameStatus, PowerUpType } from '../../../types';
import { useStore } from '../../../store';
import { MOUSETRAP_CHEESE_GEO, SHADOW_DEFAULT_GEO } from '../geometries';

// Import entity components
import { MousetrapEntity } from './MousetrapEntity';
import { CheeseEntity } from './CheeseEntity';
import { LetterEntity } from './LetterEntity';
import { PowerupEntity } from './PowerupEntity';
import { ProjectileEntity } from './ProjectileEntity';
import { BossAmmoEntity } from './BossAmmoEntity';
import { CatEntity } from './CatEntity';
import { EagleEntity } from './EagleEntity';
import { BossEntity } from './BossEntity';
import { PortalEntity } from './PortalEntity';
import { SnakeEntity } from './SnakeEntity';

interface GameEntityProps {
    data: GameObject;
}

/**
 * Cheese Fever replacement visual - shows cheese instead of enemies during fever mode
 */
const CheeseFeverEntity: React.FC<{ data: GameObject }> = ({ data }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (!groupRef.current) return;
        groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);
    });

    return (
        <group ref={groupRef}>
            <Float speed={5} rotationIntensity={2} floatIntensity={1}>
                <mesh geometry={MOUSETRAP_CHEESE_GEO} scale={2.5}>
                    <meshStandardMaterial color="#FFD700" emissive="#FFAA00" emissiveIntensity={0.6} />
                </mesh>
            </Float>
            <mesh geometry={SHADOW_DEFAULT_GEO} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#000000" opacity={0.3} transparent />
            </mesh>
        </group>
    );
};

/**
 * Main GameEntity component that routes to the appropriate entity renderer
 * Memoized to prevent unnecessary re-renders when other entities change
 */
const GameEntityInner: React.FC<GameEntityProps> = ({ data }) => {
    const { isCheeseFeverActive } = useStore();

    // During cheese fever, replace damage sources (except boss ammo) with cheese visuals
    const isFeverTarget = data.type === ObjectType.MOUSETRAP ||
                          data.type === ObjectType.SNAKE ||
                          data.type === ObjectType.CAT ||
                          data.type === ObjectType.EAGLE;

    if (isCheeseFeverActive && isFeverTarget) {
        return <CheeseFeverEntity data={data} />;
    }

    // Route to appropriate entity renderer based on type
    switch (data.type) {
        case ObjectType.MOUSETRAP:
            return <MousetrapEntity data={data} />;

        case ObjectType.SNAKE:
            return <SnakeEntity data={data} />;

        case ObjectType.CHEESE:
            return <CheeseEntity data={data} />;

        case ObjectType.POWERUP:
            return <PowerupEntity data={data} />;

        case ObjectType.LETTER:
            return <LetterEntity data={data} />;

        case ObjectType.CAT:
            return <CatEntity data={data} />;

        case ObjectType.EAGLE:
            return <EagleEntity data={data} />;

        case ObjectType.BOSS:
            return <BossEntity data={data} />;

        case ObjectType.BOSS_AMMO:
            return <BossAmmoEntity data={data} />;

        case ObjectType.PROJECTILE:
            return <ProjectileEntity data={data} />;

        case ObjectType.SHOP_PORTAL:
            return <PortalEntity data={data} />;

        default:
            return null;
    }
};

/**
 * Memoized GameEntity - only re-renders when id or active status changes
 * This prevents unnecessary re-renders of all entities when only one changes
 */
export const GameEntity = React.memo(GameEntityInner, (prevProps, nextProps) => {
    // Re-render only if id changes (new object) or active status changes
    // Position changes are handled internally by useFrame, not React re-renders
    return prevProps.data.id === nextProps.data.id &&
           prevProps.data.active === nextProps.data.active;
});

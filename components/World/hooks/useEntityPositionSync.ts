/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * useEntityPositionSync - общий hook для синхронизации позиции entity
 * Извлекает повторяющийся паттерн useFrame из всех Entity компонентов
 */

import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../../store';
import { GameStatus } from '../../../types';

export interface EntityPosition {
    position: [number, number, number];
}

export interface UseEntityPositionSyncOptions<T extends EntityPosition> {
    /** Entity data с позицией */
    data: T;
    /** Callback для применения анимации (вызывается каждый frame когда игра активна) */
    onAnimate?: (refs: { groupRef: THREE.Group }, state: { time: number; delta: number; data: T }) => void;
    /** Начальная позиция X для ref инициализации */
    initialX?: number;
}

export interface EntityPositionSyncResult {
    /** Ref на корневую группу entity */
    groupRef: React.RefObject<THREE.Group>;
}

/**
 * Hook для синхронизации позиции entity с данными игры
 * Автоматически обновляет позицию и вызывает анимацию когда игра активна
 *
 * @example
 * ```tsx
 * const { groupRef } = useEntityPositionSync({
 *     data,
 *     onAnimate: (refs, { time, data }) => {
 *         // Применить анимацию
 *     }
 * });
 * ```
 */
export function useEntityPositionSync<T extends EntityPosition>({
    data,
    onAnimate,
    initialX
}: UseEntityPositionSyncOptions<T>): EntityPositionSyncResult {
    const { status } = useStore();
    const groupRef = useRef<THREE.Group>(null);

    // Инициализация начальной позиции если указана
    if (initialX !== undefined && groupRef.current) {
        groupRef.current.position.x = initialX;
    }

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Всегда обновляем позицию
        groupRef.current.position.set(
            data.position[0],
            data.position[1],
            data.position[2]
        );

        // Анимация только когда игра активна
        if (status === GameStatus.PAUSED || status === GameStatus.COUNTDOWN) return;

        // Вызываем callback анимации если указан
        if (onAnimate) {
            onAnimate(
                { groupRef: groupRef.current },
                {
                    time: state.clock.elapsedTime,
                    delta,
                    data
                }
            );
        }
    });

    return { groupRef };
}

/**
 * Простая версия - только синхронизация позиции без анимации
 */
export function useSimplePositionSync(data: EntityPosition): EntityPositionSyncResult {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (!groupRef.current) return;
        groupRef.current.position.set(
            data.position[0],
            data.position[1],
            data.position[2]
        );
    });

    return { groupRef };
}

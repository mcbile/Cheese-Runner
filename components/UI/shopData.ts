
import { PlusCircle, Clock, Flame, Heart, Coins, Zap } from 'lucide-react';
import { ShopItem } from '../../types';

export const CONSUMABLES: ShopItem[] = [
    {
        id: 'FULL_HEAL',
        name: 'HEAL POTION',
        description: 'Restores 1 Heart.',
        details: 'Purchases a small health potion. If you are injured, it is used immediately. If healthy, it is stored in your backpack.',
        cost: 1000,
        currency: 'POINTS',
        priceType: 'FIXED',
        icon: PlusCircle,
        emoji: '💊'
    },
    {
        id: 'SLOW_MOTION',
        name: 'TIME WARP',
        description: 'Slows down time for 15s.',
        details: 'Things moving too fast? Warps time and resets the game speed to the easiest level for 15 seconds.',
        cost: 2000,
        currency: 'POINTS',
        priceType: 'FIXED',
        icon: Clock,
        emoji: '⌛️'
    },
    {
        id: 'ENEMY_RUSH',
        name: 'ENEMY RUSH',
        description: 'Spawn all enemies now!',
        details: 'Immediately spawns Snake, Cat, and Owl at once. High risk, high reward - defeat them all for big money!',
        cost: 3000,
        currency: 'POINTS',
        priceType: 'FIXED',
        icon: Zap,
        emoji: '⚡️',
        immediate: true
    }
];

export const UPGRADES: ShopItem[] = [
    {
        id: 'MAX_LIFE',
        name: 'EXTRA HEART',
        description: '+1 Max Life & Heal.',
        details: 'Permanently increases your health bar by one heart and restores 1 HP. Cost is 10x your current Bet.',
        cost: 10,
        currency: 'EURO',
        priceType: 'BET_MULTIPLIER',
        icon: Heart,
        emoji: '❤️',
        immediate: true
    },
    {
        id: 'CHEESE_FEVER',
        name: 'CHEESE MAGIC',
        description: 'Enemies become cheese (20s).',
        details: 'When activated, all traps, cats, and owls turn into giant cheese for 20 seconds. Crashing into them gives points instead of damage!',
        cost: 20,
        currency: 'EURO',
        priceType: 'BET_MULTIPLIER',
        icon: Flame,
        emoji: '🪄'
    },
    {
        id: 'INSTANT_CHEESE',
        name: 'MORE CHEESE',
        description: 'Instant +5000 Points.',
        details: 'Instantly adds 5000 Cheese Points to your score. Cost is 30x your current Bet.',
        cost: 30,
        currency: 'EURO',
        priceType: 'BET_MULTIPLIER',
        icon: Coins,
        emoji: '🏦',
        immediate: true
    }
];

export const RAW_SHOP_ITEMS = [...CONSUMABLES, ...UPGRADES];

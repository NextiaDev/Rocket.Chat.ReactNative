import Model from '@nozbe/watermelondb/Model';
import { StyleProp } from 'react-native';
import { ImageStyle } from 'react-native-fast-image';

export interface IEmoji {
	content: string;
	name: string;
	extension?: string;
	isCustom: boolean;
	count?: number;
}

export interface ICustomEmojis {
	[key: string]: Pick<IEmoji, 'name' | 'extension'>;
}

export interface ICustomEmoji {
	baseUrl?: string;
	emoji: IEmoji;
	style: StyleProp<ImageStyle>;
}

export interface ICustomEmojiModel {
	_id: string;
	name?: string;
	aliases?: string[];
	extension: string;
	_updatedAt: Date;
}

export interface IEmojiCategory {
	baseUrl: string;
	emojis: (IEmoji | string)[];
	onEmojiSelected: (emoji: IEmoji | string) => void;
	style: StyleProp<ImageStyle>;
	tabsCount: number;
}

export type TGetCustomEmoji = (name: string) => any;

export type TFrequentlyUsedEmojiModel = IEmoji & Model;
export type TCustomEmojiModel = ICustomEmojiModel & Model;

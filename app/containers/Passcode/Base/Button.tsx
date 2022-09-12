import React from 'react';
import { Text } from 'react-native';

import styles from './styles';
import { themes } from '../../../lib/constants';
import Touch from '../../Touch';
import { CustomIcon, TIconsName } from '../../CustomIcon';
import { useTheme } from '../../../theme';

interface IPasscodeButton {
	text?: string;
	icon?: TIconsName;
	disabled?: boolean;
	onPress?: Function;
}

const Button = React.memo(({ text, disabled, onPress, icon }: IPasscodeButton) => {
	const { theme } = useTheme();

	const press = () => onPress && onPress(text);

	return (
		<Touch
			style={[styles.buttonView, { backgroundColor: 'transparent' }]}
			underlayColor={themes[theme].passcodeButtonActive}
			rippleColor={themes[theme].passcodeButtonActive}
			enabled={!disabled}
			onPress={press}
		>
			{icon ? (
				<CustomIcon name={icon} size={36} color={themes[theme].passcodePrimary} />
			) : (
				<Text style={[styles.buttonText, { color: themes[theme].passcodePrimary }]}>{text}</Text>
			)}
		</Touch>
	);
});

export default Button;

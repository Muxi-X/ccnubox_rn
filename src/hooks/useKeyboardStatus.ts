import { useEffect, useState } from 'react';
import { EmitterSubscription, Keyboard } from 'react-native';

const useKeyboardStatus = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardShow, setKeyboardShow] = useState<boolean>(false);
  let keyboardShowListener: EmitterSubscription | null = null;
  let keyboardHideListener: EmitterSubscription | null = null;

  useEffect(() => {
    keyboardShowListener = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates.height);
      setKeyboardShow(true);
    });
    keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setKeyboardShow(false);
    });
    return () => {
      if (keyboardShowListener) keyboardShowListener.remove();
      if (keyboardHideListener) keyboardHideListener.remove();
    };
  }, []);

  return { isKeyboardShow, keyboardHeight };
};

export default useKeyboardStatus;

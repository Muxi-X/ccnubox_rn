import { useEffect, useState } from 'react';
import { EmitterSubscription, Keyboard } from 'react-native';

const useKeyboardShow = () => {
  const [isKeyboardShow, setKeyboardShow] = useState<boolean>(false);
  let keyboardShowListener: EmitterSubscription | null = null;
  let keyboardHideListener: EmitterSubscription | null = null;

  useEffect(() => {
    keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardShow(true);
    });
    keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardShow(false);
    });
    return () => {
      keyboardShowListener && keyboardShowListener.remove();
      keyboardHideListener && keyboardHideListener.remove();
    };
  }, []);

  return isKeyboardShow;
};

export default useKeyboardShow;

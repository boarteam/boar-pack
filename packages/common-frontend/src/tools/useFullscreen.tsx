import { useEffect, useState } from "react";
import { FullscreenExitOutlined, FullscreenOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { createStyles } from "antd-style";

function changeFullScreen(fullscreen: boolean) {
  if (fullscreen) {
    document.documentElement.requestFullscreen().catch((e) => {
      console.log(e);
    });
  } else if (document.fullscreenElement) {
    document.exitFullscreen().catch((e) => {
      console.log(e);
    });
  }
}

const useStyles = createStyles(({ token }) => {
  return {
    fullscreen: {
      backgroundColor: token.colorBgLayout,
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      width: '100%',
      height: '100%',
      overflow: 'auto',
    },
    notFullscreen: {},
  };
});

export default function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { styles } = useStyles();

  useEffect(() => {
    const listener = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', listener);
    return () => {
      document.removeEventListener('fullscreenchange', listener);
    }
  }, []);

  const button = <Button
    key="fullscreen"
    type="text"
    onClick={() => changeFullScreen(!isFullscreen)}
  >
    {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
  </Button>;

  return {
    isFullscreen,
    setIsFullscreen,
    fullscreenClassName: isFullscreen ? styles.fullscreen : styles.notFullscreen,
    fullscreenButton: button,
  };
}

import { useEffect } from "react";

export function useKey(key, settingUp) {
  useEffect(() => {
    function callback(e) {
      if (e.code.toLowerCase() === key.toLowerCase()) {
        settingUp();
      }
    }
    document.addEventListener("keydown", callback);

    return () => document.removeEventListener("keydown", callback);
  }, [key, settingUp]);
}

import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function useTabs<T extends string>(defaultTab: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<T>(() => {
    return searchParams.get('tab') as T ?? defaultTab;
  });

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', tab);
    setSearchParams(newSearchParams, { replace: true });
  }, [tab]);

  return [tab, setTab];
}

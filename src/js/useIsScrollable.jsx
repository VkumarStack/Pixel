import { useState, useCallback, useLayoutEffect } from "react";

// Component from https://codesandbox.io/s/vibrant-shannon-05o50?file=/src/useIsScrollable.tsx 
const useIsScrollable = (dependencies) => {
    const [node, setNode] = useState();
    const ref = useCallback((node) => {
        setNode(node);
    }, []);
    
    const [isScrollable, setIsScrollable] = useState(false);

    useLayoutEffect(() => {
        if (!node)
            return;
        setIsScrollable(node.scrollHeight > node.clientHeight);
    }, [...dependencies, node]);

    useLayoutEffect(() => {
        if (!node)
            return;
        const handleWindowResize = () => {
            setIsScrollable(node.scrollHeight > node.clientHeight);
        };

        window.addEventListener("resize", handleWindowResize);

        return () => window.removeEventListener("resize", handleWindowResize);
    }, [node]);

    return [isScrollable, ref, node];
}

export default useIsScrollable;
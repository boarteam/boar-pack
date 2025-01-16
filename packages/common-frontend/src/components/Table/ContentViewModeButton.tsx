import { Button, Tooltip } from "antd";
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
export enum VIEW_MODE_TYPE {
    TABS = 'tabs',
    GENERAL = 'general'
}

interface ContentViewModeButtonProps {
    contentViewMode: VIEW_MODE_TYPE;
    setContentViewMode: (mode: VIEW_MODE_TYPE) => void;
}

const ContentViewModeButton: React.FC<ContentViewModeButtonProps> = ({ contentViewMode, setContentViewMode }) => {
    return (
        <Tooltip
            title={contentViewMode === VIEW_MODE_TYPE.TABS ? 'Switch to general view' : 'Switch to tabs view'}
            key="viewModeToggle">
            <Button
                type="text"
                icon={contentViewMode === VIEW_MODE_TYPE.TABS ? <UnorderedListOutlined/> :
                    <AppstoreOutlined/>}
                onClick={() => setContentViewMode(contentViewMode === VIEW_MODE_TYPE.TABS ? VIEW_MODE_TYPE.GENERAL : VIEW_MODE_TYPE.TABS)}
            />
        </Tooltip>);
};

export default ContentViewModeButton;

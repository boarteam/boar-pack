import { IconStore, MODELS, XFlowGraphCommands } from '@antv/xflow-core';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  OneToOneOutlined,
  CompressOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';
import { createToolbarConfig } from '@antv/xflow';
import type { IToolbarGroupOptions } from '@antv/xflow-core';

export const CANVAS_SCALE_TOOLBAR_CONFIG = {
  ZOOM_IN: XFlowGraphCommands.GRAPH_ZOOM.id + '-zoom-in',
  ZOOM_OUT: XFlowGraphCommands.GRAPH_ZOOM.id + '-zoom-out',
  SCALE_TO_ONE: XFlowGraphCommands.GRAPH_ZOOM.id + '-scale-to-one',
  SCALE_TO_FIT: XFlowGraphCommands.GRAPH_ZOOM.id + '-scale-to-fit',
  FULLSCREEN: XFlowGraphCommands.GRAPH_FULLSCREEN.id + '-fullscreen',
  MAX_SCALE: 1.5,
  MIN_SCALE: 0.05,
  zoomOptions: {
    maxScale: 1.5,
    minScale: 0.05,
  }
} as const;

// Setting up icon mappings
IconStore.set('ZoomInOutlined', ZoomInOutlined);
IconStore.set('ZoomOutOutlined', ZoomOutOutlined);
IconStore.set('OneToOneOutlined', OneToOneOutlined);
IconStore.set('CompressOutlined', CompressOutlined);
IconStore.set('FullscreenOutlined', FullscreenOutlined);
IconStore.set('FullscreenExitOutlined', FullscreenExitOutlined);

export const getToolbarConfig = ({
  zoomFactor,
  fullscreen
}: { zoomFactor?: number, fullscreen?: boolean }): IToolbarGroupOptions[] => {
  return [
    {
      name: 'main',
      items: [
        {
          id: CANVAS_SCALE_TOOLBAR_CONFIG.ZOOM_IN,
          tooltip: 'Zoom In',
          iconName: 'ZoomInOutlined',
          onClick: async ({ commandService }) => {
            await commandService.executeCommand(XFlowGraphCommands.GRAPH_ZOOM.id, {
              factor: 0.1,
              zoomOptions: CANVAS_SCALE_TOOLBAR_CONFIG.zoomOptions,
            });
          },
        },
        {
          id: CANVAS_SCALE_TOOLBAR_CONFIG.ZOOM_OUT,
          tooltip: 'Zoom Out',
          iconName: 'ZoomOutOutlined',
          onClick: async ({ commandService }) => {
            await commandService.executeCommand(XFlowGraphCommands.GRAPH_ZOOM.id, {
              factor: -0.1,
              zoomOptions: CANVAS_SCALE_TOOLBAR_CONFIG.zoomOptions,
            });
          },
        },
        // Other toolbar items...
      ],
    },
  ];
};

export const TOOLBAR_TYPE = 'CANVAS_SCALE_TOOLBAR';

export const useConfig = createToolbarConfig(async (config) => {
  config.setToolbarModelService(async (model, modelService) => {
    const graphScale = await MODELS.GRAPH_SCALE.useValue(modelService);
    model.setValue(m => {
      m.mainGroups = getToolbarConfig({
        zoomFactor: graphScale.zoomFactor,
        fullscreen: false,
      });
    });

    const graphFullscreenModel = await MODELS.GRAPH_FULLSCREEN.getModel(modelService);
    graphFullscreenModel.setValue(false);

    graphFullscreenModel.watch(async (fullscreen) => {
      model.setValue(m => {
        m.mainGroups = getToolbarConfig({
          zoomFactor: graphScale.zoomFactor,
          fullscreen,
        });
      });
    });

    const graphScaleModel = await MODELS.GRAPH_SCALE.getModel(modelService);
    graphScaleModel.watch(async ({ zoomFactor }) => {
      const fullscreen = await MODELS.GRAPH_FULLSCREEN.useValue(modelService);
      model.setValue(m => {
        m.mainGroups = getToolbarConfig({
          zoomFactor,
          fullscreen,
        });
      });
    });
  });
});

import { ProDescriptions } from "@ant-design/pro-components";
import { Button, Card, message, Space, Typography } from "antd";
import React, { useContext } from "react";
import { useIntl } from "umi";
import apiClient from "@@api/apiClient";
import { EventSettingsDto, TelegramSettingsUpdateDto } from "@@api/generated";
import { SettingsContext } from "../../components/Settings/settingsContext";

const { Title, Text, Paragraph } = Typography;

const isBoolean = (value: any) => {
  return [true, false].includes(value)
}

async function onSaveTelegramSettings(row: TelegramSettingsUpdateDto) {
  apiClient.telegraf.setTelegramSettings({
    requestBody: row,
  }).catch(e => {
    console.error(e);
  });
}

async function onSaveEventSettings(row: EventSettingsDto) {
  apiClient.settings.setEventSettings({
    requestBody: row,
  }).catch(e => {
    console.error(e);
  });
}

export const NotificationsSettings: React.FC = () => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [settingsChanging, setSettingsChanging] = React.useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const intl = useIntl();
  const settingsContext = useContext(SettingsContext);

  const testSettings = async () => {
    setLoading(true);
    try {
      await apiClient.telegraf.testTelegraf();
      messageApi.success(intl.formatMessage({ id: 'pages.notifications.testSuccess' }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div>
        <Title level={3}>Introduction</Title>
        <Paragraph>
          This service allows you to receive important event notifications through Telegram. You'll be able to stay
          informed about system usage and health.
        </Paragraph>

        <Title level={4}>Creation of Telegram Bot</Title>
        <Paragraph>
          <ol>
            <li>Register your bot by sending the command <Text copyable={true} code>/newbot</Text> to <a
              href="https://t.me/BotFather" target="_blank" rel="noreferrer"
            >@BotFather</a> and follow the
              instructions.
            </li>
            <li>Copy the bot token provided by @BotFather and paste it in the "Telegram Bot Access Token" field.</li>
            <li>Add your bot to the group you wish to send notifications to.</li>
          </ol>
        </Paragraph>

        <Title level={4}>Telegram Notifications Setup</Title>

        <Title level={5}>Option 1: Personal Notifications</Title>
        <Paragraph>
          <ol>
            <li>Send the command <Text code copyable={true}>/getid</Text> to the bot named <a
              href="https://t.me/myidbot" target="_blank" rel="noreferrer"
            >@myidbot</a> in your Telegram messenger.
            </li>
            <li>Copy the chat ID returned by the bot and paste it in the designated "Telegram Chat ID" field.</li>
          </ol>
        </Paragraph>

        <Title level={5}>Option 2: Notifications for Telegram Groups</Title>
        <Paragraph>
          <ol>
            <li>Add the bot named <a
              href="https://t.me/myidbot" target="_blank" rel="noreferrer"
            >@myidbot</a> to your Telegram group.</li>
            <li>Send the command <Text code copyable={true}>/getgroupid</Text> to @myidbot within the group chat.
            </li>
            <li>Copy the group ID returned by the bot and paste it in the designated "Telegram Chat ID" field.</li>
          </ol>
        </Paragraph>
      </div>

      <Space direction={'vertical'} size={"middle"}>
        <ProDescriptions<TelegramSettingsUpdateDto>
          bordered={true}
          size={'small'}
          formProps={{
            onValuesChange: async (changedValues) => {
              if (Object.keys(changedValues).some(key => isBoolean(changedValues[key]))) {
                setSettingsChanging(true);
                await onSaveTelegramSettings(changedValues);
                setSettingsChanging(false);
              }
            }
          }}
          columns={[
            {
              title: 'Telegram notifications enabled',
              dataIndex: 'enabled',
              valueType: 'switch',
              span: 4,
              mode: 'update',
              fieldProps: {
                loading: settingsChanging,
              },
            },
            {
              title: 'Telegram Bot Access Token',
              dataIndex: 'botToken',
              valueType: 'password',
              span: 4,
            },
            {
              title: 'Telegram Chat ID',
              dataIndex: 'chatId',
              valueType: 'text',
              span: 4,
            },
          ]}
          request={async () => {
            return {
              success: true,
              data: await apiClient.telegraf.getTelegramSettings()
            }
          }}
          editable={{
            onSave: async (key, row) => {
              setSettingsChanging(true);
              await onSaveTelegramSettings(row);
              setSettingsChanging(false);
            },
            actionRender: (row, config, dom) => {
              if (config.recordKey === 'enabled') {
                return [];
              }

              return [dom.save, dom.cancel];
            }
          }}
        />
        {settingsContext.columns.length > 0 && (
          <ProDescriptions<EventSettingsDto>
            title='Events'
            bordered={true}
            size={'small'}
            formProps={{
              onValuesChange: async (changedValues) => {
                if (Object.keys(changedValues).some(key => isBoolean(changedValues[key]))) {
                  setSettingsChanging(true);
                  await onSaveEventSettings(changedValues);
                  setSettingsChanging(false);
                }
              }
            }}
            columns={[
              ...settingsContext.columns.map(column => ({
                ...column,
                fieldProps: {
                  loading: settingsChanging,
                  ...column.fieldProps,
                },
              })),
            ]}
            request={async () => {
              return {
                success: true,
                data: await apiClient.settings.getEventSettings()
              }
            }}
            editable={{
              onSave: async (key, row) => {
                setSettingsChanging(true);
                await onSaveEventSettings(row);
                setSettingsChanging(false);
              },
              actionRender: () => {
                return [];
              }
            }}
          />
        )}
        <Button
          type="primary"
          loading={loading}
          onClick={testSettings}
        >Send test message</Button>
      </Space>
      {contextHolder}
    </Card>
  )
}

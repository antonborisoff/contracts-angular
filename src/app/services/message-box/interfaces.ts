export enum MessageActions {
  CLOSE = 'close',
  CONFIRM = 'confirm',
  CANCEL = 'cancel'
}

export enum MessageType {
  ERROR = 'error',
  CONFIRM = 'confirm'
}

interface MessageDisplayAttributes {
  icon: string
  titleKey: string
}
export const MESSAGE_DISPLAY_ATTRIBUTES_MAP: Record<MessageType, MessageDisplayAttributes> = {
  [MessageType.ERROR]: {
    icon: 'report_problem',
    titleKey: 'ERROR_TITLE'
  },
  [MessageType.CONFIRM]: {
    icon: 'help_outline',
    titleKey: 'CONFIRM_TITLE'
  }
}

export interface MessageConfig {
  type: MessageType
  message: string
  buttons: {
    key: MessageActions
    raised: boolean
  }[]
}

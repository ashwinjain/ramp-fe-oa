export type InputSelectItem = { label: string; value: string }

export type InputSelectProps<TItem> = {
  label: string
  defaultValue?: TItem | null
  onChange: (value: TItem | null) => void
  items: TItem[]
  parseItem: (item: TItem) => InputSelectItem
  isLoading?: boolean
  enabled: boolean // Bug 8: Employees are clickable before transactions are loaded
  loadingLabel: string
}

export type DropdownPosition = {
  top: number
  left: number
}

export type InputSelectOnChange<TItem> = (selectedItem: TItem | null) => void

export type GetDropdownPositionFn = (target: EventTarget) => DropdownPosition

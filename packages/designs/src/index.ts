/*
 * @kian/designs: the parts of the Student Intelligence design kit that Kian uses.
 *
 * Plain React components styled by plain CSS (`ds-` classes on `--ds-*` tokens),
 * so the website and the Electron renderer share one look. Import the styles
 * once per app: `@kian/designs/tokens.css` then `@kian/designs/designs.css`.
 */

export { ActionButton, type ActionButtonProps, type ActionStatus } from './ActionButton'
export { Avatar, type AvatarProps, type AvatarTone } from './Avatar'
export { AvatarStack, type AvatarStackPerson, type AvatarStackProps } from './AvatarStack'
export { Badge, type BadgeProps } from './Badge'
export { BrandMark, type BrandMarkProps } from './BrandMark'
export { Button, type ButtonProps } from './Button'
export { Check, type CheckProps } from './Check'
export { Chip, type ChipProps } from './Chip'
export { Field, type FieldProps } from './Field'
export { Icon, type IconName } from './Icon'
export { Keycap, type KeycapProps } from './Keycap'
export { Menu, type MenuEntry, type MenuProps } from './Menu'
export { Row, type RowProps } from './Row'
export { RowList, type RowListProps } from './RowList'
export { SearchField, type SearchFieldProps } from './SearchField'
export { Segmented, type SegmentedOption, type SegmentedProps } from './Segmented'
export { Select, type SelectOption, type SelectProps } from './Select'
export {
  Sidebar,
  SidebarAction,
  type SidebarActionProps,
  SidebarFooter,
  SidebarHeader,
  type SidebarHeaderProps,
  SidebarItem,
  type SidebarItemProps,
  SidebarSection,
  type SidebarSectionProps,
} from './Sidebar'
export { Spinner, type SpinnerProps } from './Spinner'
export { type TabItem, Tabs, type TabsProps } from './Tabs'
export { notify, Toast, type ToastProps } from './Toast'
export { Toggle, type ToggleProps } from './Toggle'
export { Tooltip, type TooltipProps } from './Tooltip'
export { Window, type WindowProps } from './Window'
export type { BrandName } from './brands'

/** Layout uses the available window, including iPad multitasking, not the device name. */
export function layoutForWidth(windowWidth: number, fontScale = 1, horizontalInsets = 0) {
  const width = Math.max(0, Math.min(windowWidth, 1100) - horizontalInsets);
  const gutter = width < 360 ? 12 : width >= 700 ? 28 : 20;
  const contentWidth = Math.max(0, width - gutter * 2);
  const columns = fontScale > 1.35 ? 1 : contentWidth >= 960 ? 3 : contentWidth >= 620 ? 2 : 1;
  return { width, gutter, contentWidth, columns, isWide: columns > 1,
    gridCardWidth: (contentWidth - (columns - 1) * 16) / columns,
    carouselWidth: Math.min(460, columns > 1 ? (contentWidth - 16) / 2 : Math.max(0, contentWidth - 24)),
    planWidth: Math.min(320, fontScale > 1.35 || contentWidth < 300 ? contentWidth - 24 : (contentWidth - 12) / 2) };
}

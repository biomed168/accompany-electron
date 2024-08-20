import { exposeThemeContext } from '@/main/helpers/ipc/theme/theme-context';
import { exposeWindowContext } from '@/main/helpers/ipc/window/window-context';

export default function exposeContexts() {
  exposeWindowContext();
  exposeThemeContext();
}

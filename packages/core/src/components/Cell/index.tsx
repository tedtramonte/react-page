import classNames from 'classnames';
import * as React from 'react';

import {
  useCellProps,
  useIsEditMode,
  useIsFocused,
  useIsLayoutMode,
  useIsPreviewMode,
  useIsResizeMode,
  useLang,
  useScrollToViewEffect,
} from '../hooks';
import ErrorCell from './ErrorCell';
import Inner from './Inner';
import scrollIntoViewWithOffset from './utils/scrollIntoViewWithOffset';

const gridClass = ({
  isPreviewMode,
  isEditMode,
  size,
}: {
  isPreviewMode: boolean;
  isEditMode: boolean;
  size: number;
}): string => {
  if (isPreviewMode || isEditMode) {
    return `ory-cell-${isPreviewMode || isEditMode ? 'sm' : 'xs'}-${
      size || 12
    } ory-cell-xs-12`;
  }

  return `ory-cell-xs-${size || 12}`;
};

const stopClick = (_isEditMode: boolean) => (
  e: React.MouseEvent<HTMLDivElement>
) => (_isEditMode ? e.stopPropagation() : null);

const CellErrorGate = class extends React.Component<
  {
    nodeId: string;
  },
  { error: Error }
> {
  state = {
    error: null,
  };
  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  render() {
    if (this.state.error) {
      return <ErrorCell nodeId={this.props.nodeId} error={this.state.error} />;
    }
    return this.props.children;
  }
};

type Props = {
  nodeId: string;
  measureRef?: React.Ref<HTMLDivElement>;
};
const Cell: React.FC<Props> = ({ nodeId, measureRef }) => {
  const focused = useIsFocused(nodeId);

  const {
    inline,
    hasInlineNeighbour,
    isDraft,
    isDraftI18n,
    size,
  } = useCellProps(
    nodeId,
    ({ inline, hasInlineNeighbour, isDraft, isDraftI18n, size }) => ({
      inline,
      hasInlineNeighbour,
      isDraft,
      isDraftI18n,
      size,
    })
  );

  const lang = useLang();
  const isPreviewMode = useIsPreviewMode();
  const isResizeMode = useIsResizeMode();
  const isEditMode = useIsEditMode();
  const isLayoutMode = useIsLayoutMode();

  const isDraftInLang = isDraftI18n?.[lang] ?? isDraft;
  const ref = React.useRef<HTMLDivElement>();
  useScrollToViewEffect(
    nodeId,
    () => {
      if (ref.current) scrollIntoViewWithOffset(ref.current, 0);
    },
    [ref.current]
  );
  if (isDraftInLang && isPreviewMode) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={classNames(
        'ory-cell',
        gridClass({
          isEditMode,
          isPreviewMode,
          size,
        }),
        {
          'ory-cell-has-inline-neighbour': hasInlineNeighbour,
          [`ory-cell-inline-${inline || ''}`]: inline,
          'ory-cell-focused': focused,
          'ory-cell-is-draft': isDraftInLang,
          'ory-cell-resizing-overlay': isResizeMode,
          'ory-cell-bring-to-front': !isResizeMode && !isLayoutMode && inline, // inline must not be active for resize/layout
        }
      )}
      onClick={stopClick(isEditMode)}
    >
      <div ref={measureRef} style={{ height: '100%' }}>
        <CellErrorGate nodeId={nodeId}>
          <Inner nodeId={nodeId} />
        </CellErrorGate>
      </div>
    </div>
  );
};

export default React.memo(Cell);

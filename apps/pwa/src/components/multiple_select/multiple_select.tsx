import {
  KeyboardEventHandler,
  FocusEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import styled, { css } from 'styled-components';
import { MdClose } from 'react-icons/md';
import { CSSVariable } from '../../global_style';
import Label from '../label';
import { Option as OptionType } from './constants';
import ellipsis from '../../style/ellipsis';
import Options from './options';
import notice from '../../utils/notice';
import e, { EventType } from './eventemitter';
import useOptions from './use_options';
import useEvent from '../../utils/use_event';

const onGetDataErrorDefault = (error: Error) => notice.error(error.message);
const Input = styled.div<{ active: boolean; disabled: boolean }>`
  padding: 5px 10px;

  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;

  cursor: pointer;
  border: 1px solid;
  transition: inherit;

  > .input {
    flex: 1;
    min-width: 30px;

    border: none;
    outline: none;
    font-size: 14px;

    &:disabled {
      background-color: transparent;
    }
  }

  ${({ active, disabled }) => css`
    border-color: ${disabled
      ? CSSVariable.TEXT_COLOR_DISABLED
      : active
      ? CSSVariable.COLOR_PRIMARY
      : CSSVariable.COLOR_BORDER};
    background: ${disabled ? CSSVariable.BACKGROUND_DISABLED : 'transparent'};
    cursor: ${disabled ? 'not-allowed' : 'pointer'};

    > .input {
      color: ${active ? CSSVariable.TEXT_COLOR_PRIMARY : 'transparent'};
    }
  `}
`;
const Item = styled.div<{ disabled: boolean }>`
  max-width: 100%;
  padding: 3px 3px 3px 7px;

  border: 1px solid ${CSSVariable.COLOR_BORDER};
  cursor: default;
  user-select: none;

  display: flex;
  align-items: center;
  gap: 3px;

  > .label {
    font-size: 12px;
    line-height: 1;
    color: ${CSSVariable.TEXT_COLOR_PRIMARY};
    ${ellipsis}
  }

  > svg {
    width: 16px;
    flex-shrink: 0;
  }

  ${({ disabled }) => css`
    > svg {
      cursor: ${disabled ? 'not-allowed' : 'pointer'};
      color: ${disabled
        ? CSSVariable.TEXT_COLOR_DISABLED
        : CSSVariable.TEXT_COLOR_SECONDARY};
    }
  `}
`;

function MultipleSelect<Value>({
  label,
  value,
  onChange,
  dataGetter,
  onGetDataError = onGetDataErrorDefault,
  emptyMesssage = '暂无数据',
  disabled = false,
  addon,
}: {
  label: string;
  value: OptionType<Value>[];
  onChange: (options: OptionType<Value>[]) => void;
  dataGetter: (
    search: string,
  ) => OptionType<Value>[] | Promise<OptionType<Value>[]>;
  onGetDataError?: (error: Error) => void;
  emptyMesssage?: string;
  disabled?: boolean;
  addon?: ReactNode;
}) {
  const id = useId();

  const inputBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [keyword, setKeyword] = useState('');

  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);

  const timerRef = useRef(0);
  const onFocus: FocusEventHandler<HTMLInputElement> = useEvent(() => {
    window.clearTimeout(timerRef.current);
    return setAnchor(inputBoxRef.current);
  });
  const onBlur: FocusEventHandler<HTMLInputElement> = useEvent(() => {
    timerRef.current = window.setTimeout(() => setAnchor(null), 200);
  });
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = useEvent(
    (event) => {
      const v = (event.target as HTMLInputElement).value;
      if (event.key === 'Backspace' && !v) {
        onChange(value.slice(0, v.length - 1));
      }
    },
  );
  const onRemove = useCallback(
    (option: OptionType<Value>) => {
      if (disabled) {
        return;
      }
      return onChange(value.filter((i) => i.key !== option.key));
    },
    [disabled, onChange, value],
  );

  const { loading, options } = useOptions({
    keyword,
    dataGetter,
    onGetDataError,
  });

  useEffect(() => {
    const unlistenOnChange = e.listen(
      EventType.ON_CHANGE,
      ({ id: emitId, option }) => {
        if (id !== emitId) {
          return;
        }
        const included = value.some((i) => i.key === option.key);
        onChange(
          included
            ? value.filter((i) => i.key !== option.key)
            : [...value, option as OptionType<Value>],
        );

        window.setTimeout(() => setKeyword(''), 1000);
      },
    );
    return unlistenOnChange;
  }, [id, onChange, value]);

  const selectedKeys = value.map((i) => i.key);
  return (
    <>
      <Label label={label} active={!!anchor} disabled={disabled} addon={addon}>
        <Input active={!!anchor} disabled={disabled} ref={inputBoxRef}>
          {value.map((option) => (
            <Item key={option.key} disabled={disabled}>
              <div className="label">{option.label}</div>
              <MdClose onClick={() => onRemove(option)} />
            </Item>
          ))}
          <input
            className="input"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            disabled={disabled}
            ref={inputRef}
          />
        </Input>
      </Label>
      <Options
        id={id}
        loading={loading}
        options={options}
        selectedKeys={selectedKeys}
        emptyMesssage={emptyMesssage}
        anchor={anchor}
      />
    </>
  );
}

export default MultipleSelect;

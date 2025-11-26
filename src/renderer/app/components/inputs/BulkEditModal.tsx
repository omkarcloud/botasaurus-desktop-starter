import { EuiButton } from '@elastic/eui/optimize/es/components/button/button';
import { EuiButtonEmpty } from '@elastic/eui/optimize/es/components/button/button_empty/button_empty';
import { EuiModal } from '@elastic/eui/optimize/es/components/modal/modal';
import { EuiModalBody } from '@elastic/eui/optimize/es/components/modal/modal_body';
import { EuiModalFooter } from '@elastic/eui/optimize/es/components/modal/modal_footer';
import { EuiModalHeader } from '@elastic/eui/optimize/es/components/modal/modal_header';
import { EuiModalHeaderTitle } from '@elastic/eui/optimize/es/components/modal/modal_header_title';
import { useState } from 'react';
import ClickOutside from '../ClickOutside/ClickOutside';
import TextAreaField from './TextAreaField';
import { isUrl } from '../../utils/missc';

function isEmpty(x: any) {
  return x === null || x === undefined || (typeof x === "string" && x.trim() === "");
}

export function isNotEmpty(x: any) {
  return !isEmpty(x);
}

function stripChars(input: string) {
  // Remove " or ' from the start of the string
  let result = input.replace(/^[\'\"]+/, '');
  // Remove , from the end of the string
  result = result.replace(/,$/, '');
  // Remove " or ' from the end of the string
  result = result.replace(/[\'\"]+$/, '');
  return result;
}

function findLink(inputString: string) {
  const regex = /http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/;
  const match = inputString.match(regex);
  return match ? match[0] : null;
}

export function getLink(string: string) {
  if (isUrl(string)) {
    return string;
  }
  return findLink(string);
}

export function parseStringToList(input: string): string[] {
  input = input.trim();

  // Handle empty string
  if (input === '') {
    return [];
  }

  try {
    // Try to parse as JSON
    const jsonList = JSON.parse(input);
    if (Array.isArray(jsonList)) {
      return jsonList.map(x => `${x}`.trim());
    }
  } catch (e) {
    const split = input.split(/[\n]+/);
    const lines = split.map(s => stripChars(s.trim()).trim()).filter(isNotEmpty);
    if (lines.length === 1) {
      return lines[0].split(/[,]+/).map((s: string) => stripChars(s.trim()).trim()).filter(isNotEmpty);
    } else {
      return lines;
    }
  }
  return [];
}

function computeItemsLen(items: string[], islinks: boolean = false) {
  let count: number;
  if (islinks) {
    count = items.map(getLink).filter(x => x !== null).length;
  } else {
    count = items.filter(isNotEmpty).length;
  }
  
  const itemText = islinks ? (count === 1 ? "Link" : "Links") : (count === 1 ? "Item" : "Items");
  return (count > 0 ? ` ${count} ` : ' ') + itemText;
}

interface BulkEditModalProps {
  closeModal: () => void;
  id: string;
  value: string[];
  onChangeValue: (newValue: string[]) => void;
  islinks?: boolean;
}

export default function BulkEditModal({ closeModal, id, value, onChangeValue, islinks = false }: BulkEditModalProps) {
  const [modaltext, onChangeModalText] = useState(() => {
    if (islinks) {
      return value.filter(isNotEmpty).map(getLink).filter(x => x !== null).map(x => x.trim()).join('\n');
    } else {
      return value.filter(isNotEmpty).map(x => x.trim()).join('\n');
    }
  });

  const placeholder = islinks 
    ? `Paste a list of links in one of the following formats:
- JSON array (e.g., ["https://stackoverflow.com/", "https://apache.org/"])
- Comma separated (e.g., https://stackoverflow.com/, https://apache.org/)
- Newline separated, e.g. 
    https://stackoverflow.com/
    https://apache.org/`
    : `Paste a list of items in one of the following formats:
- JSON array (e.g., ["apple", "guava"])
- Comma separated (e.g., apple, guava)
- Newline-separated, e.g. 
    apple
    guava`;

  const handleAdd = () => {
    let parsed = parseStringToList(modaltext);
    
    if (islinks) {
      parsed = parsed.map(getLink).filter(x => x !== null);
    }
    
    onChangeValue(parsed);
    closeModal();
  };

  return (
    <EuiModal onClose={closeModal}>
      <ClickOutside handleClickOutside={closeModal}>
        <div style={{ minWidth: 720 }}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>Paste Items</EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <TextAreaField
              rows={12}
              placeholder={placeholder}
              name={id}
              value={modaltext}
              onChange={onChangeModalText}
            />
          </EuiModalBody>
          <EuiModalFooter>
            <EuiButtonEmpty onClick={closeModal}>Cancel</EuiButtonEmpty>
            <EuiButton onClick={handleAdd}>
              {'Add' + computeItemsLen(parseStringToList(modaltext), islinks)}
            </EuiButton>
          </EuiModalFooter>
        </div>
      </ClickOutside>
    </EuiModal>
  );
}



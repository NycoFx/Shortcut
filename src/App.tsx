import React, { useState, useEffect, useRef } from "react";
import { useCallback } from "react";

interface Option {
  id: number;
  value: string;
}

const options: Option[] = [
  { id: 1, value: "Opção 1" },
  { id: 2, value: "Opção 2" },
  { id: 3, value: "Opção 3" },
];

function replaceBetween(
  start: number,
  end: number,
  what: string,
  text: string
) {
  console.log(text, start, end);
  return text.substring(0, start) + what + text.substring(end);
}

const ListItem = ({
  data,
  highlightedIndex,
}: {
  data: { id: number; value: string }[];
  highlightedIndex: number | null;
}) => {
  return (
    <div>
      {data.map((option, index) => (
        <div
          key={option.id}
          style={highlightedIndex === index ? { background: "lightgray" } : {}}
        >
          {option.value}
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [cursorPos, setCursorPos] = useState<{
    firstPos: number;
    lastPos: number;
  }>({ firstPos: 0, lastPos: 0 });
  const [open, setOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef<boolean>(true);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const getCursorPosition = useCallback(() => {
    inputValue.split("").map((item, index) => {
      console.log(index);
      if (inputValue.length === index && mounted.current) {
        setCursorPos({ ...cursorPos, firstPos: index });
        mounted.current = false;
      }
      return item;
    });
  }, [inputValue, cursorPos]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const filtered = options.filter((option) => option.value.toLowerCase());
      setHighlightedIndex(filtered.length > 0 ? 0 : null);

      if (inputValue === "") setOpen(false);
      if (event.key === "/") {
        setOpen(true);
        getCursorPosition();
      }

      if (event.key === "Escape") {
        setCursorPos({ firstPos: 0, lastPos: 0 });
        mounted.current = true;
        setHighlightedIndex(null);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (highlightedIndex !== null) {
          const previousIndex =
            highlightedIndex === 0 ? options.length - 1 : highlightedIndex - 1;
          setHighlightedIndex(previousIndex);
        }
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        if (highlightedIndex !== null) {
          const nextIndex = (highlightedIndex + 1) % options.length;
          setHighlightedIndex(nextIndex);
        }
      } else if (event.key === "Enter" && open) {
        event.preventDefault();
        if (highlightedIndex !== null) {
          const lastIndex = inputValue.length;
          console.log(lastIndex);
          const selected = options[highlightedIndex];
          if (cursorPos?.firstPos) {
            setCursorPos((prevState) => ({ ...prevState, lastPos: lastIndex }));
          }
          const newValue = replaceBetween(
            cursorPos.firstPos,
            cursorPos.lastPos,
            selected.value,
            inputValue
          );
          console.log(newValue);
          setInputValue(newValue);
          mounted.current = true;
          setOpen(false);
          // setHighlightedIndex(null);
        }
      }
    },
    [getCursorPosition, highlightedIndex, cursorPos, inputValue, open]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, inputValue]);

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        // onKeyDown={handleKeyDown}
        ref={inputRef}
      />
      {open ? (
        <ListItem data={options} highlightedIndex={highlightedIndex} />
      ) : null}
    </div>
  );
};

export default App;

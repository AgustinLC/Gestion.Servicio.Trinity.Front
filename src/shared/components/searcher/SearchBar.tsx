import React, { useState } from "react";
import { Form } from "react-bootstrap";

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = "Buscar..." }) => {
    const [query, setQuery] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <Form.Control
            className="search-bar-input"
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleChange}
        />
    );
};

export default SearchBar;
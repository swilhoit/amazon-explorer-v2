import React, {useContext} from 'react';

import Notifications from '../components/DropdownNotifications';
import Help from '../components/DropdownHelp';
import UserMenu from '../components/DropdownProfile';
import ThemeToggle from '../components/ThemeToggle';
import {Button} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CSVUpload from "./CSVUpload";
import {AuthContext} from "../AuthContext";

function Header({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
                  searchKeywords,
                  setSearchKeywords,
                  handleSearch,
                  isLoading,
                  handleCSVUpload
}) {
    const { isAuthenticated } = useContext(AuthContext);

    return (
    <header className={`sticky top-0 before:absolute before:inset-0 before:backdrop-blur-md max-lg:before:bg-white/90 dark:max-lg:before:bg-gray-800/90 before:-z-10 z-30 ${variant === 'v2' || variant === 'v3' ? 'before:bg-white after:absolute after:h-px after:inset-x-0 after:top-full after:bg-gray-200 dark:after:bg-gray-700/60 after:-z-10' : 'max-lg:shadow-sm lg:before:bg-gray-100/90 dark:lg:before:bg-gray-900/90'} ${variant === 'v2' ? 'dark:before:bg-gray-800' : ''} ${variant === 'v3' ? 'dark:before:bg-gray-900' : ''}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between h-16 ${variant === 'v2' || variant === 'v3' ? '' : 'lg:border-b border-gray-200 dark:border-gray-700/60'}`}>

          {/* Header: Left side */}
          <div className="flex">

              <h1 className="font-medium text-[20px] dark:text-white">
                  Amazon Explorer
              </h1>
          </div>

          {/* Header: Right side */}
            {isAuthenticated && (<div className="flex items-center space-x-3">
                <div className="flex items-center">
                    <input
                        id="name"
                        className="form-input min-w-[380px] mr-4"
                        value={searchKeywords}
                        placeholder="Search for products (comma-separated keywords)"
                        onChange={(e) => setSearchKeywords(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearch();
                            }
                        }}

                    />
                    <button
                        className="btn border-gray-200 dark:border-gray-700/60 shadow-sm text-violet-500 disabled:opacity-50 mr-2"
                        onClick={handleSearch}
                        disabled={isLoading}
                    >
                        <SearchIcon/>
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                    <CSVUpload
                        onDataUpload={handleCSVUpload}
                        setLoading={() => {
                        }}
                        buttonText="Upload"
                    />
                </div>
                <ThemeToggle/>
                {/*  Divider */}
                <hr className="w-px h-6 bg-gray-200 dark:bg-gray-700/60 border-none"/>
                <UserMenu align="right"/>

            </div>)}

        </div>
      </div>
    </header>
  );
}

export default Header;
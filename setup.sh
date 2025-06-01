#!/bin/bash
# Podcast Maker - Setup Script
# This script initializes the Podcast Maker project by:
# - Installing dependencies
# - Setting up environment variables
# - Running the test script
# - Initializing git
# - Providing next steps

# ANSI color codes for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
  echo -e "\n${BOLD}${BLUE}=== $1 ===${NC}\n"
}

# Function to print success messages
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Function to print warning messages
print_warning() {
  echo -e "${YELLOW}! $1${NC}"
}

# Function to print info messages
print_info() {
  echo -e "${CYAN}$1${NC}"
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for required tools
check_prerequisites() {
  print_header "Checking Prerequisites"
  
  # Check for Node.js
  if ! command_exists node; then
    print_error "Node.js is not installed"
    echo -e "Please install Node.js v18 or higher from ${BOLD}https://nodejs.org/${NC}"
    exit 1
  fi
  
  # Check Node.js version
  NODE_VERSION=$(node -v | cut -d 'v' -f 2)
  NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)
  
  if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
    print_error "Node.js version $NODE_VERSION is too old"
    echo -e "Please upgrade to Node.js v18 or higher from ${BOLD}https://nodejs.org/${NC}"
    exit 1
  fi
  
  print_success "Node.js v$NODE_VERSION is installed"
  
  # Check for npm
  if ! command_exists npm; then
    print_error "npm is not installed"
    echo "Please install npm (it usually comes with Node.js)"
    exit 1
  fi
  
  print_success "npm $(npm -v) is installed"
  
  # Check for git
  if ! command_exists git; then
    print_warning "git is not installed"
    echo "Git is recommended for version control but not required for setup"
    echo -e "You can install git from ${BOLD}https://git-scm.com/${NC}"
  else
    print_success "git $(git --version | cut -d ' ' -f 3) is installed"
  fi
}

# Install dependencies
install_dependencies() {
  print_header "Installing Dependencies"
  
  # Check if package.json exists
  if [ ! -f "package.json" ]; then
    print_error "package.json not found"
    echo "Please run this script from the project root directory"
    exit 1
  fi
  
  print_info "Installing npm packages (this may take a few minutes)..."
  
  # Run npm install
  if npm install; then
    print_success "Dependencies installed successfully"
  else
    print_error "Failed to install dependencies"
    echo "Try running 'npm install' manually to see detailed errors"
    exit 1
  fi
}

# Set up environment variables
setup_environment() {
  print_header "Setting Up Environment Variables"
  
  # Check if .env.example exists
  if [ ! -f ".env.example" ]; then
    print_error ".env.example not found"
    echo "Please ensure the .env.example file is in the project root"
    exit 1
  fi
  
  # Check if .env.local already exists
  if [ -f ".env.local" ]; then
    print_warning ".env.local already exists"
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_info "Keeping existing .env.local file"
      return
    fi
  fi
  
  # Copy .env.example to .env.local
  cp .env.example .env.local
  
  print_success "Created .env.local from template"
  print_info "Default API keys are included, but for production use, please update with your own keys:"
  echo -e "  ${YELLOW}OPENROUTER_API_KEY${NC} - Get from ${BOLD}https://openrouter.ai/keys${NC}"
  echo -e "  ${YELLOW}ELEVENLABS_API_KEY${NC} - Get from ${BOLD}https://elevenlabs.io/subscription${NC}"
  
  # Prompt to edit the file
  read -p "Do you want to edit the .env.local file now? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command_exists nano; then
      nano .env.local
    elif command_exists vim; then
      vim .env.local
    elif command_exists vi; then
      vi .env.local
    else
      print_warning "No text editor found (tried nano, vim, vi)"
      echo "Please edit .env.local manually to update API keys"
    fi
  fi
}

# Run the test script
run_tests() {
  print_header "Running Test Script"
  
  # Check if test-setup.js exists
  if [ ! -f "test-setup.js" ]; then
    print_error "test-setup.js not found"
    echo "Please ensure the test script is in the project root"
    exit 1
  fi
  
  # Make test script executable
  chmod +x test-setup.js
  
  print_info "Running API connectivity tests..."
  
  # Install required packages for the test script if they don't exist
  if ! npm list axios >/dev/null 2>&1 || ! npm list dotenv >/dev/null 2>&1; then
    print_info "Installing test script dependencies..."
    npm install --no-save axios dotenv
  fi
  
  # Run the test script
  if node test-setup.js; then
    print_success "All tests passed successfully"
  else
    print_warning "Some tests failed"
    echo "Please check the error messages above and fix any issues"
    echo "You can run the test script again with 'node test-setup.js'"
  fi
}

# Initialize git repository
init_git() {
  print_header "Initializing Git Repository"
  
  # Check if git is installed
  if ! command_exists git; then
    print_warning "Git is not installed, skipping git initialization"
    return
  fi
  
  # Check if .git directory already exists
  if [ -d ".git" ]; then
    print_info "Git repository already initialized"
    
    # Check git status
    git_status=$(git status --porcelain)
    if [ -n "$git_status" ]; then
      print_info "You have uncommitted changes:"
      git status --short
      
      read -p "Do you want to commit these changes? (y/N) " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Initial setup of Podcast Maker project"
        print_success "Changes committed"
      fi
    else
      print_success "Working directory is clean"
    fi
    
    return
  fi
  
  # Initialize git repository
  if git init; then
    print_success "Git repository initialized"
    
    # Create .gitignore file if it doesn't exist
    if [ ! -f ".gitignore" ]; then
      cat > .gitignore << EOF
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage
/test-output

# Next.js
/.next/
/out/
/build
/dist

# Environment variables
.env*.local
.env

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
.DS_Store
*.pem
.idea/
.vscode/
EOF
      print_success "Created .gitignore file"
    fi
    
    # Add all files and make initial commit
    git add .
    git commit -m "Initial commit of Podcast Maker project"
    print_success "Initial commit created"
    
    # Prompt for remote repository
    read -p "Do you want to add a remote repository? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      read -p "Enter the remote repository URL: " remote_url
      if [ -n "$remote_url" ]; then
        git remote add origin "$remote_url"
        print_success "Remote repository added"
        
        read -p "Do you want to push to the remote repository now? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
          git push -u origin main || git push -u origin master
        fi
      fi
    fi
  else
    print_error "Failed to initialize git repository"
  fi
}

# Print next steps
print_next_steps() {
  print_header "Next Steps"
  
  echo -e "${BOLD}1. Start the development server:${NC}"
  echo -e "   ${YELLOW}npm run dev${NC}"
  echo
  echo -e "${BOLD}2. Open your browser at:${NC}"
  echo -e "   ${YELLOW}http://localhost:3000${NC}"
  echo
  echo -e "${BOLD}3. Create your first podcast:${NC}"
  echo -e "   - Click on 'Create New Podcast'"
  echo -e "   - Choose a category and tone"
  echo -e "   - Generate a script with OpenRouter AI"
  echo -e "   - Convert to audio with ElevenLabs"
  echo
  echo -e "${BOLD}4. Explore the application:${NC}"
  echo -e "   - Browse categories and playlists"
  echo -e "   - Play podcasts in the media player"
  echo -e "   - Create custom playlists"
  echo
  echo -e "${BOLD}Documentation:${NC}"
  echo -e "   - See README.md for detailed information"
  echo -e "   - API documentation in the /docs folder"
  echo
  echo -e "${PURPLE}${BOLD}Thank you for setting up Podcast Maker!${NC}"
  echo -e "${PURPLE}Happy podcasting!${NC}"
}

# Main function
main() {
  echo -e "${BOLD}${PURPLE}
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║        🎙️  PODCAST MAKER SETUP  🎙️        ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝${NC}"
  
  # Run all setup steps
  check_prerequisites
  install_dependencies
  setup_environment
  run_tests
  init_git
  print_next_steps
}

# Run the main function
main

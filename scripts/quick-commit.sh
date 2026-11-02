#!/bin/bash

# Quick Commit Script for collidr
# Simple script for daily commits without version changes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get commit type
if [ -z "$1" ]; then
    echo "Commit types:"
    echo "  feat     - New feature"
    echo "  fix      - Bug fix"
    echo "  docs     - Documentation"
    echo "  style    - Code style"
    echo "  refactor - Code refactoring"
    echo "  test     - Tests"
    echo "  chore    - Maintenance"
    echo "  perf     - Performance"
    echo "  ci       - CI/CD"
    echo
    read -p "Enter commit type: " COMMIT_TYPE
else
    COMMIT_TYPE=$1
fi

# Get commit message
if [ -z "$2" ]; then
    read -p "Enter commit message: " COMMIT_MSG
else
    COMMIT_MSG=$2
fi

# Validate inputs
if [ -z "$COMMIT_TYPE" ]; then
    print_error "Commit type is required"
    exit 1
fi

if [ -z "$COMMIT_MSG" ]; then
    print_error "Commit message is required"
    exit 1
fi

# Check if there are changes to commit
if [ -z "$(git status --porcelain)" ]; then
    print_warning "No changes to commit"
    exit 0
fi

# Show git status
print_status "Git status:"
git status --short

# Confirm commit
echo
read -p "Do you want to commit these changes? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Commit cancelled"
    exit 0
fi

# Stage all changes
print_status "Staging changes"
git add .

# Commit
FULL_COMMIT_MSG="$COMMIT_TYPE: $COMMIT_MSG"
print_status "Committing with message: $FULL_COMMIT_MSG"
git commit -m "$FULL_COMMIT_MSG"

# Push to remote
read -p "Do you want to push to remote? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Pushing to remote"
    git push origin main
fi

print_success "Commit completed successfully!"
print_status "Commit message: $FULL_COMMIT_MSG"

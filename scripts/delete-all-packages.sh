#!/bin/bash

# Xala Enterprise Package Deletion Script
# This script deletes all package repositories from GitHub (excluding Foundation)

set -e

echo "🗑️  Xala Enterprise Package Deletion"
echo "===================================="
echo ""

# Configuration
GITHUB_ORG="Xala-Technologies"
FOUNDATION_REPO="Xala-Enterprise-Foundation"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_dependencies() {
    echo "🔍 Checking dependencies..."

    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is required but not installed."
        echo "   Install it from: https://cli.github.com/"
        exit 1
    fi

    print_success "All dependencies found"
}

check_github_auth() {
    echo "🔐 Checking GitHub authentication..."

    if ! gh auth status &> /dev/null; then
        print_error "Not authenticated with GitHub CLI."
        echo "   Run: gh auth login"
        exit 1
    fi

    print_success "GitHub authentication verified"
}

list_xala_repositories() {
    echo "📋 Listing Xala Enterprise repositories..."

    # Get all Xala-Enterprise repositories
    local repos=($(gh repo list "$GITHUB_ORG" --limit 50 | grep "Xala-Enterprise-" | awk '{print $1}' | grep -v "$FOUNDATION_REPO" || true))

    if [ ${#repos[@]} -eq 0 ]; then
        print_info "No Xala Enterprise package repositories found to delete"
        return 1
    fi

    echo ""
    echo "Found ${#repos[@]} package repositories to delete:"
    for repo in "${repos[@]}"; do
        echo "   - $repo"
    done

    return 0
}

confirm_deletion() {
    echo ""
    print_warning "This will PERMANENTLY DELETE all Xala Enterprise package repositories!"
    print_info "The following repository will be PRESERVED:"
    echo "   - $GITHUB_ORG/$FOUNDATION_REPO"
    echo ""

    read -p "Are you absolutely sure you want to continue? Type 'DELETE' to confirm: " confirmation

    if [ "$confirmation" != "DELETE" ]; then
        print_info "Operation cancelled - no repositories were deleted"
        exit 0
    fi

    echo ""
    print_warning "Last chance to cancel..."
    read -p "Press Enter to proceed with deletion, or Ctrl+C to cancel: "
}

delete_repositories() {
    echo ""
    echo "🗑️  Starting repository deletion..."

    local deleted_repos=()
    local failed_repos=()

    # Get repositories to delete
    local repos=($(gh repo list "$GITHUB_ORG" --limit 50 | grep "Xala-Enterprise-" | awk '{print $1}' | grep -v "$FOUNDATION_REPO" || true))

    if [ ${#repos[@]} -eq 0 ]; then
        print_info "No repositories to delete"
        return
    fi

    for repo in "${repos[@]}"; do
        echo ""
        echo "🗑️  Deleting $repo..."

        if gh repo delete "$repo" --yes 2>/dev/null; then
            print_success "Deleted $repo"
            deleted_repos+=("$repo")
        else
            print_error "Failed to delete $repo"
            failed_repos+=("$repo")
        fi

        # Small delay to avoid rate limiting
        sleep 1
    done

    # Summary
    echo ""
    echo "📊 DELETION SUMMARY"
    echo "=================="
    echo ""

    if [ ${#deleted_repos[@]} -gt 0 ]; then
        print_success "Successfully deleted ${#deleted_repos[@]} repositories:"
        for repo in "${deleted_repos[@]}"; do
            echo "   - $repo"
        done
        echo ""
    fi

    if [ ${#failed_repos[@]} -gt 0 ]; then
        print_error "Failed to delete ${#failed_repos[@]} repositories:"
        for repo in "${failed_repos[@]}"; do
            echo "   - $repo"
        done
        echo ""
        print_info "You may need to delete these manually or check permissions"
    fi

    if [ ${#deleted_repos[@]} -gt 0 ] && [ ${#failed_repos[@]} -eq 0 ]; then
        print_success "All package repositories deleted successfully!"
    elif [ ${#deleted_repos[@]} -eq 0 ]; then
        print_error "No repositories were deleted"
        exit 1
    fi
}

verify_deletion() {
    echo ""
    echo "🔍 Verifying deletion..."

    # Check if any Xala-Enterprise repositories still exist (excluding Foundation)
    local remaining_repos=($(gh repo list "$GITHUB_ORG" --limit 50 | grep "Xala-Enterprise-" | awk '{print $1}' | grep -v "$FOUNDATION_REPO" || true))

    if [ ${#remaining_repos[@]} -eq 0 ]; then
        print_success "Verification complete - all package repositories successfully deleted"
        print_info "Foundation repository preserved: $GITHUB_ORG/$FOUNDATION_REPO"
    else
        print_warning "Some repositories may still exist:"
        for repo in "${remaining_repos[@]}"; do
            echo "   - $repo"
        done
    fi
}

cleanup_local_packages() {
    local packages_dir="$(pwd)/xala-packages"

    if [ -d "$packages_dir" ]; then
        echo ""
        print_warning "Local packages directory found: $packages_dir"
        read -p "Do you want to delete the local packages directory as well? (y/N): " -n 1 -r
        echo

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🗑️  Deleting local packages directory..."
            rm -rf "$packages_dir"
            print_success "Local packages directory deleted"
        else
            print_info "Local packages directory preserved"
        fi
    fi
}

# Main execution
main() {
    echo "Starting Xala Enterprise package deletion process..."
    echo ""

    # Check dependencies
    check_dependencies
    check_github_auth

    # List repositories that will be deleted
    if ! list_xala_repositories; then
        exit 0
    fi

    # Get confirmation
    confirm_deletion

    # Delete repositories
    delete_repositories

    # Verify deletion
    verify_deletion

    # Offer to cleanup local packages
    cleanup_local_packages

    echo ""
    print_success "Package deletion process completed!"
    echo ""
    print_info "🔗 Remaining repositories: https://github.com/$GITHUB_ORG"
    print_info "📁 Foundation repository: https://github.com/$GITHUB_ORG/$FOUNDATION_REPO"
}

# Show help if requested
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Xala Enterprise Package Deletion Script"
    echo ""
    echo "This script deletes all Xala Enterprise package repositories from GitHub"
    echo "while preserving the Foundation repository."
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --list         List repositories that would be deleted (dry run)"
    echo ""
    echo "Safety features:"
    echo "  - Requires typing 'DELETE' to confirm"
    echo "  - Preserves the Foundation repository"
    echo "  - Shows summary of deleted/failed repositories"
    echo "  - Offers to cleanup local packages directory"
    echo ""
    exit 0
fi

# List only mode
if [[ "$1" == "--list" ]]; then
    echo "🔍 DRY RUN - Repositories that would be deleted:"
    echo ""
    check_dependencies
    check_github_auth
    list_xala_repositories
    echo ""
    print_info "Run without --list flag to actually delete repositories"
    exit 0
fi

# Run main function
main "$@"

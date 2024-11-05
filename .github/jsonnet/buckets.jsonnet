{
  // Uploads all files in the source folder to the destination bucket, including compression and TTL headers.
  //
  // Warnings:
  // - remote/destination files not included in the source will be DELETED recursively if pruneRemote is true!
  // - the files in the source directory will be modified. Do not attempt to use this directory after running this command.
  // - must be run with bash shell.
  //
  // Parameters:
  // sourcePath: The source directory to upload. Can be a local folder of a path in a bucket, depending on sourceBucket. Required.
  // sourceBucket: The source bucket. If null, the sourcePath is a local directory. Defaults to null.
  // destinationBucket: The destination bucket. Required.
  // destinationPath: The destination directory in the bucket. Required.
  //
  // pruneRemote: If true, all files in the destination bucket that are not in the source will be deleted. Can only be used with destinationPath containing 'pr-'.
  //
  // compressFileExtentions: A list of file extentions that will be compressed. Set to an empty list to disable compression.
  // compressJobs: The number of parallel gzip compression jobs. Use 4 for arc-runner-2 and 16 for arc-runner-16. Defaults to 4.
  //
  // lowTTLfiles: A list of files, or a single regex, that will be uploaded with a low TTL. Use this for files that are not fingerprinted.
  //
  // lowTTL: The TTL for lowTTLfiles. Defaults to 60 seconds.
  // lowTTLStaleWhileRevalidate: The stale-while-revalidate value for lowTTLfiles. Defaults to 60 seconds.
  // lowTTLHeader: The Cache-Control header for lowTTLfiles. This is generated from lowTTL and lowTTLStaleWhileRevalidate.
  //
  // highTTL: The TTL for all other files. Defaults to 1 week.
  // highTTLStaleWhileRevalidate: The stale-while-revalidate value for all other files. Defaults to 1 day.
  // highTTLHeader: The Cache-Control header for all other files. This is generated from highTTL and highTTLStaleWhileRevalidate.
  //
  // additionalHeaders: Additional headers to add to all uploaded files. This should be an array of strings.
  uploadFilesToBucketCommand(
    sourcePath,
    sourceBucket=null,
    destinationBucket,
    destinationPath,
    pruneRemote=false,
    compressFileExtentions=['css', 'svg', 'html', 'json', 'js', 'xml', 'txt', 'map'],
    compressJobs=4,
    lowTTLfiles=[],
    lowTTL=60,
    lowTTLStaleWhileRevalidate=60,
    lowTTLHeader='Cache-Control: public, max-age=' + lowTTL + (if lowTTLStaleWhileRevalidate == 0 then '' else ', stale-while-revalidate=' + lowTTLStaleWhileRevalidate),
    highTTL=604800,  // 1 week
    highTTLStaleWhileRevalidate=86400,  // 1 day
    highTTLHeader='Cache-Control: public, max-age=' + highTTL + (if highTTLStaleWhileRevalidate == 0 then '' else ', stale-while-revalidate=' + highTTLStaleWhileRevalidate),
    additionalHeaders=[],
  )::
    // if this function is called with remote pruning, destination must contain pr-
    assert !pruneRemote || std.length(std.findSubstr('/pr-', destinationPath)) > 0;

    local hasLowTTLfiles = (std.isArray(lowTTLfiles) && std.length(lowTTLfiles) > 0) || (std.isString(lowTTLfiles) && lowTTLfiles != '');
    local lowTTLfilesRegex = if std.isArray(lowTTLfiles) then '(' + std.strReplace(std.join('|', lowTTLfiles), '.', '\\.') + ')' else lowTTLfiles;
    local highTTLfilesRegex = '(?!' + lowTTLfilesRegex + ').*';

    local hasCompressedFiles = (std.isArray(compressFileExtentions) && std.length(compressFileExtentions) > 0) || (std.isString(compressFileExtentions) && compressFileExtentions != '');
    local compressedFilesRegex = '(' + std.join('|', std.map(function(ext) '((.*(\\.|/))?' + ext + ')', compressFileExtentions)) + ')';
    local uncompressedFilesRegex = '(?!' + compressedFilesRegex + ').*';

    local compressionHeader = 'Content-Encoding: gzip';


    local rsyncCommand = function(name, excludeRegexes, headers)
      local excludeRegex = if std.length(excludeRegexes) == 0 then null else '^((' + std.join(')|(', excludeRegexes) + '))$';

      'echo "Uploading ' + name + ' files"\n' +
      'gsutil -m ' + std.join(' ', std.map(function(header) '-h "' + header + '" ', headers + additionalHeaders)) + 'rsync -r -c' +
      (if excludeRegex == null then '' else ' -x "' + excludeRegex + '"') +
      (if pruneRemote then ' -d' else '') +
      (if sourceBucket == null then ' ./' else ' gs://' + sourceBucket + '/' + sourcePath + '/') +
      ' gs://' + destinationBucket + '/' + destinationPath + '/;\n' +
      'echo "Uploading ' + name + ' files completed"; echo\n' +
      '\n';

    'set -e -o pipefail;\n' +
    (if sourceBucket == null then 'cd ' + sourcePath + ';\n' else '') +
    '\n' +


    if hasCompressedFiles then
      (
        if sourceBucket == null then
          'echo "Compressing files in parallel before uploading"\n' +
          '{\n' +
          "  for file in `find . -type f -regextype posix-egrep -regex '" + compressedFilesRegex + "' | sed --expression 's/\\.\\///g'`; do\n" +
          '    echo "gzip -9 $file; mv $file.gz $file"\n' +
          '  done\n' +
          '} | parallel --halt now,fail=1 -j ' + compressJobs + '\n' +
          'echo "Compressing files in parallel completed"\n' +
          '\n'
        else ''
      ) +

      if hasLowTTLfiles then
        rsyncCommand(
          'highTTL compressed',
          excludeRegexes=[lowTTLfilesRegex, uncompressedFilesRegex],
          headers=[highTTLHeader, compressionHeader],
        ) +
        rsyncCommand(
          'highTTL uncompressed',
          excludeRegexes=[lowTTLfilesRegex, compressedFilesRegex],
          headers=[highTTLHeader],
        ) +

        rsyncCommand(
          'lowTTL compressed',
          excludeRegexes=[highTTLfilesRegex, uncompressedFilesRegex],
          headers=[lowTTLHeader, compressionHeader],
        ) +
        rsyncCommand(
          'lowTTL uncompressed',
          excludeRegexes=[highTTLfilesRegex, compressedFilesRegex],
          headers=[lowTTLHeader],
        )


      else  // no lowTTL files, with compression
        rsyncCommand(
          'compressed',
          excludeRegexes=[uncompressedFilesRegex],
          headers=[highTTLHeader, compressionHeader],
        ) +
        rsyncCommand(
          'uncompressed',
          excludeRegexes=[compressedFilesRegex],
          headers=[highTTLHeader],
        )


    else  // no compression
      if hasLowTTLfiles then
        rsyncCommand(
          'highTTL',
          excludeRegexes=[lowTTLfilesRegex],
          headers=[highTTLHeader],
        ) +

        rsyncCommand(
          'lowTTL',
          excludeRegexes=[highTTLfilesRegex],
          headers=[lowTTLHeader],
        )


      else  // no lowTTL files, no compression
        rsyncCommand(
          'all',
          excludeRegexes=[],
          headers=[highTTLHeader],
        ),

}
